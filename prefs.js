import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const SOURCE_VALUES = ['mock', 'codex-app-server'];
const SOURCE_LABELS = ['Mock data', 'Codex app-server'];
const DISPLAY_VALUES = ['bucket-percent', 'percent-only', 'state-label'];
const DISPLAY_LABELS = ['Bucket and percent', 'Percent only', 'State label'];
const PRIORITY_VALUES = ['lowest', 'five-hour', 'weekly'];
const PRIORITY_LABELS = ['Lowest remaining', '5-hour', 'Weekly'];
const MOCK_VALUES = ['normal', 'warning', 'limit-reached', 'stale', 'unavailable', 'error', 'not-authenticated', 'not-configured', 'rate-limited', 'timeout'];
const MOCK_LABELS = ['Normal', 'Warning', 'Limit reached', 'Stale', 'Unavailable', 'Error', 'Not authenticated', 'Not configured', 'Rate limited', 'Timeout'];

function makeStringList(labels) {
    const list = new Gtk.StringList();
    for (const label of labels)
        list.append(label);
    return list;
}

function bindDropDown(settings, key, values, labels) {
    const dropDown = new Gtk.DropDown({
        model: makeStringList(labels),
        valign: Gtk.Align.CENTER,
    });

    const updateSelected = () => {
        const index = values.indexOf(settings.get_string(key));
        dropDown.selected = index >= 0 ? index : 0;
    };

    updateSelected();
    dropDown.connect('notify::selected', () => {
        const index = dropDown.selected;
        if (values[index] && settings.get_string(key) !== values[index])
            settings.set_string(key, values[index]);
    });
    settings.connect(`changed::${key}`, updateSelected);
    return dropDown;
}

function addActionRow(group, title, subtitle, widget) {
    const row = new Adw.ActionRow({title, subtitle});
    row.add_suffix(widget);
    row.activatable_widget = widget;
    group.add(row);
}

function addSpinRow(group, settings, key, title, subtitle, min, max, step) {
    const adjustment = new Gtk.Adjustment({
        lower: min,
        upper: max,
        step_increment: step,
        page_increment: step * 5,
        value: settings.get_int(key),
    });
    const spin = new Gtk.SpinButton({
        adjustment,
        numeric: true,
        valign: Gtk.Align.CENTER,
    });
    settings.bind(key, adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
    addActionRow(group, title, subtitle, spin);
}

function addMinuteSpinRow(group, settings, key, title, subtitle, min, max) {
    const adjustment = new Gtk.Adjustment({
        lower: min,
        upper: max,
        step_increment: 1,
        page_increment: 5,
        value: Math.round(settings.get_int(key) / 60),
    });
    const spin = new Gtk.SpinButton({
        adjustment,
        numeric: true,
        valign: Gtk.Align.CENTER,
    });
    let updating = false;

    const updateFromSettings = () => {
        const minutes = Math.max(min, Math.min(max, Math.round(settings.get_int(key) / 60)));
        if (adjustment.value === minutes)
            return;
        updating = true;
        adjustment.value = minutes;
        updating = false;
    };

    adjustment.connect('value-changed', () => {
        if (updating)
            return;
        const seconds = Math.round(adjustment.value) * 60;
        if (settings.get_int(key) !== seconds)
            settings.set_int(key, seconds);
    });
    settings.connect(`changed::${key}`, updateFromSettings);
    updateFromSettings();
    addActionRow(group, title, subtitle, spin);
}

function addSwitchRow(group, settings, key, title, subtitle) {
    const toggle = new Gtk.Switch({
        active: settings.get_boolean(key),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(key, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);
    addActionRow(group, title, subtitle, toggle);
}

export default class CodexUsagePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Codex Usage',
            icon_name: 'utilities-system-monitor-symbolic',
        });

        const sourceGroup = new Adw.PreferencesGroup({title: 'Source'});
        addActionRow(sourceGroup, 'Source', 'Choose mock data or the local Codex app-server provider.', bindDropDown(settings, 'source-kind', SOURCE_VALUES, SOURCE_LABELS));
        addActionRow(sourceGroup, 'Mock Scenario', 'Select representative mock data for local UI checks.', bindDropDown(settings, 'mock-scenario', MOCK_VALUES, MOCK_LABELS));

        const commandEntry = new Gtk.Entry({
            text: settings.get_string('codex-command'),
            valign: Gtk.Align.CENTER,
            hexpand: true,
        });
        commandEntry.connect('changed', () => settings.set_string('codex-command', commandEntry.text.trim() || 'codex'));
        settings.connect('changed::codex-command', () => {
            if (commandEntry.text !== settings.get_string('codex-command'))
                commandEntry.text = settings.get_string('codex-command');
        });
        addActionRow(sourceGroup, 'Codex Command', 'Executable path used for codex app-server --listen stdio://.', commandEntry);

        const refreshGroup = new Adw.PreferencesGroup({title: 'Refresh'});
        addMinuteSpinRow(refreshGroup, settings, 'refresh-interval-seconds', 'Refresh Interval', 'Automatic refresh interval in whole minutes.', 1, 30);
        addSwitchRow(refreshGroup, settings, 'refresh-paused', 'Refresh Pause', 'Stop automatic and manual usage refresh attempts.');
        addSpinRow(refreshGroup, settings, 'timeout-seconds', 'Timeout', 'Maximum provider refresh time in seconds.', 5, 300, 1);
        addSpinRow(refreshGroup, settings, 'warning-threshold-percent', 'Warning Threshold', 'Percent remaining at or below which a bucket is low.', 1, 99, 1);

        const displayGroup = new Adw.PreferencesGroup({title: 'Display'});
        addActionRow(displayGroup, 'Panel Format', 'Compact top-bar text format.', bindDropDown(settings, 'display-format', DISPLAY_VALUES, DISPLAY_LABELS));
        addActionRow(displayGroup, 'Bucket Priority', 'Bucket used for the compact panel state.', bindDropDown(settings, 'bucket-priority', PRIORITY_VALUES, PRIORITY_LABELS));

        page.add(sourceGroup);
        page.add(refreshGroup);
        page.add(displayGroup);
        window.add(page);
    }
}
