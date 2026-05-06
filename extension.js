import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {CodexAppServerSource} from './lib/codexAppServerSource.js';
import {addPanelIndicator, destroyActor, removeSource} from './lib/compatibility.js';
import {formatBucketRow, formatLastRefresh, withDisplayFields} from './lib/formatter.js';
import {
    OVERALL_STATUSES,
    SOURCE_KINDS,
    isSuccessfulSnapshot,
    markSnapshotStale,
    shouldMarkStale,
} from './lib/model.js';
import {MockBalanceSource} from './lib/mockSource.js';
import {configFromSettings, connectSettings, disconnectSettings} from './lib/settings.js';

const INDICATOR_ID = 'codex-usage-indicator';
const PANEL_STATUS_CLASSES = [
    'codex-usage-panel-loading',
    'codex-usage-panel-normal',
    'codex-usage-panel-warning',
    'codex-usage-panel-limit-reached',
    'codex-usage-panel-stale',
    'codex-usage-panel-not-authenticated',
    'codex-usage-panel-not-configured',
    'codex-usage-panel-error',
];

const CodexUsageIndicator = GObject.registerClass(
class CodexUsageIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Codex Usage Indicator', false);

        this.add_style_class_name('codex-usage-panel');
        this._box = new St.BoxLayout({
            style_class: 'codex-usage-panel-box',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._label = new St.Label({
            text: 'Codex Loading',
            style_class: 'codex-usage-panel-label',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._box.add_child(this._label);
        this.add_child(this._box);
    }

    setText(text) {
        this._label.text = text;
    }

    setStatus(status) {
        for (const styleClass of PANEL_STATUS_CLASSES)
            this.remove_style_class_name(styleClass);
        this.add_style_class_name(`codex-usage-panel-${status}`);
    }
});

function createSource(config) {
    if (config.sourceKind === SOURCE_KINDS.CODEX_APP_SERVER)
        return new CodexAppServerSource(config);
    return new MockBalanceSource(config);
}

function addLabelPair(item, leftText, rightText, styleClass = null) {
    const left = new St.Label({
        text: leftText,
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: styleClass ?? '',
    });
    const right = new St.Label({
        text: rightText,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: styleClass ?? '',
    });
    item.add_child(left);
    item.add_child(right);
}

export default class CodexUsageExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._config = configFromSettings(this._settings);
        this._settingsSignals = connectSettings(this._settings, () => this._onSettingsChanged());
        this._indicator = new CodexUsageIndicator();
        this._source = createSource(this._config);
        this._snapshot = null;
        this._lastSuccessfulSnapshot = null;
        this._refreshPromise = null;
        this._refreshCancellable = null;
        this._refreshTimerId = 0;

        addPanelIndicator(Main, INDICATOR_ID, this._indicator, 0, 'right');
        this._renderLoading();
        this._scheduleRefreshTimer();
        this._refresh();
    }

    disable() {
        if (this._refreshTimerId) {
            removeSource(this._refreshTimerId);
            this._refreshTimerId = 0;
        }

        if (this._refreshCancellable && !this._refreshCancellable.is_cancelled())
            this._refreshCancellable.cancel();

        if (this._source) {
            this._source.cancel();
            this._source.destroy();
            this._source = null;
        }

        disconnectSettings(this._settings, this._settingsSignals);
        this._settingsSignals = [];
        this._settings = null;

        destroyActor(this._indicator);
        this._indicator = null;
        this._snapshot = null;
        this._lastSuccessfulSnapshot = null;
        this._refreshPromise = null;
        this._refreshCancellable = null;
    }

    _onSettingsChanged() {
        const oldSourceKind = this._config?.sourceKind;
        const oldMockScenario = this._config?.mockScenario;
        this._config = configFromSettings(this._settings);

        if (oldSourceKind !== this._config.sourceKind || oldMockScenario !== this._config.mockScenario) {
            if (this._source)
                this._source.destroy();
            this._source = createSource(this._config);
            this._lastSuccessfulSnapshot = null;
        }

        this._scheduleRefreshTimer();
        this._render(this._snapshot ? withDisplayFields(this._snapshot, this._config) : null);
        this._refresh();
    }

    _scheduleRefreshTimer() {
        if (this._refreshTimerId)
            removeSource(this._refreshTimerId);

        this._refreshTimerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._config.refreshIntervalSeconds, () => {
            this._refresh();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _renderLoading() {
        this._render({
            overallStatus: OVERALL_STATUSES.LOADING,
            displayText: 'Codex Loading',
            detailText: 'Refreshing Codex Balance',
            fiveHour: null,
            weekly: null,
            lastSuccessfulUpdateUnix: null,
            errorMessage: null,
        });
    }

    _renderRefreshing() {
        const snapshot = this._effectiveSnapshot(this._snapshot);
        if (snapshot)
            this._render({...snapshot, detailText: 'Refreshing Codex Balance'});
        else
            this._renderLoading();
    }

    _effectiveSnapshot(snapshot) {
        if (!snapshot)
            return null;
        const now = Math.floor(Date.now() / 1000);
        if (shouldMarkStale(snapshot, now))
            return withDisplayFields(markSnapshotStale(snapshot, 'Codex Balance data is stale.', now), this._config);
        return withDisplayFields(snapshot, this._config);
    }

    _refresh() {
        if (this._refreshPromise)
            return this._refreshPromise;

        this._refreshCancellable = new Gio.Cancellable();
        this._refreshPromise = this._source.refresh(this._refreshCancellable, this._config)
            .then(snapshot => {
                let effective = snapshot;
                if (isSuccessfulSnapshot(snapshot)) {
                    this._lastSuccessfulSnapshot = snapshot;
                } else if (this._lastSuccessfulSnapshot) {
                    effective = markSnapshotStale(this._lastSuccessfulSnapshot, snapshot.errorMessage ?? snapshot.detailText);
                }

                this._snapshot = effective;
            })
            .catch(error => {
                const message = error?.message ?? 'Unable to refresh Codex Balance.';
                if (this._lastSuccessfulSnapshot)
                    this._snapshot = markSnapshotStale(this._lastSuccessfulSnapshot, message);
            })
            .finally(() => {
                this._refreshPromise = null;
                this._refreshCancellable = null;
                this._render(this._effectiveSnapshot(this._snapshot));
            });

        this._renderRefreshing();

        return this._refreshPromise;
    }

    _render(snapshot) {
        if (!this._indicator)
            return;

        const display = snapshot?.displayText ?? 'Codex Loading';
        const status = snapshot?.overallStatus ?? OVERALL_STATUSES.LOADING;
        this._indicator.setText(display);
        this._indicator.setStatus(status);
        this._rebuildMenu(snapshot);
    }

    _rebuildMenu(snapshot) {
        this._indicator.menu.removeAll();

        if (!snapshot) {
            const loading = new PopupMenu.PopupMenuItem('Refreshing Codex Balance', {reactive: false});
            loading.setSensitive(false);
            this._indicator.menu.addMenuItem(loading);
            return;
        }

        if (snapshot.fiveHour)
            this._addBucketRow(snapshot.fiveHour);
        if (snapshot.weekly)
            this._addBucketRow(snapshot.weekly);

        this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const stateItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        addLabelPair(stateItem, 'State', snapshot.detailText ?? snapshot.overallStatus, 'codex-usage-state-row');
        this._indicator.menu.addMenuItem(stateItem);

        const refreshItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        addLabelPair(refreshItem, 'Freshness', formatLastRefresh(snapshot.lastSuccessfulUpdateUnix), 'codex-usage-state-row');
        this._indicator.menu.addMenuItem(refreshItem);

        if (snapshot.errorMessage) {
            const message = new PopupMenu.PopupMenuItem(snapshot.errorMessage, {reactive: false});
            message.setSensitive(false);
            message.add_style_class_name('codex-usage-message-row');
            this._indicator.menu.addMenuItem(message);
        }

        this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const action = new PopupMenu.PopupMenuItem(this._refreshPromise ? 'Refreshing...' : 'Refresh Now');
        action.add_style_class_name('codex-usage-action-row');
        action.setSensitive(!this._refreshPromise);
        action.connect('activate', () => this._refresh());
        this._indicator.menu.addMenuItem(action);
    }

    _addBucketRow(bucket) {
        const row = formatBucketRow(bucket);
        const item = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        item.add_style_class_name('codex-usage-bucket-row');

        const column = new St.BoxLayout({vertical: true, x_expand: true});
        const title = new St.Label({
            text: row.label,
            style_class: 'codex-usage-bucket-title',
            x_expand: true,
            x_align: Clutter.ActorAlign.START,
        });
        const meta = new St.Label({
            text: `${row.status} · ${row.reset}`,
            style_class: 'codex-usage-bucket-meta',
            x_expand: true,
            x_align: Clutter.ActorAlign.START,
        });
        column.add_child(title);
        column.add_child(meta);

        const value = new St.Label({
            text: row.value,
            style_class: 'codex-usage-bucket-value',
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
        });

        item.add_child(column);
        item.add_child(value);
        this._indicator.menu.addMenuItem(item);
    }
}
