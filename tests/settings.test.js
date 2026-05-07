import {
    DEFAULT_CONFIG,
    configFromSettings,
    connectSettings,
    normalizeConfig,
    refreshIntervalMinuteLabel,
    refreshIntervalMinutesToSeconds,
    refreshIntervalSecondsToMinutes,
} from '../lib/settings.js';

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected)
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

class FakeSettings {
    constructor(overrides = {}) {
        this._values = {
            'source-kind': 'codex-app-server',
            'mock-scenario': 'normal',
            'codex-command': 'codex',
            'refresh-interval-seconds': 300,
            'refresh-paused': false,
            'timeout-seconds': 15,
            'warning-threshold-percent': 25,
            'display-format': 'bucket-percent',
            'bucket-priority': 'lowest',
            ...overrides,
        };
        this.connectedSignals = [];
    }

    get_string(key) {
        return this._values[key];
    }

    get_int(key) {
        return this._values[key];
    }

    get_boolean(key) {
        return this._values[key];
    }

    connect(signal) {
        this.connectedSignals.push(signal);
        return this.connectedSignals.length;
    }
}

assertEqual(DEFAULT_CONFIG.refreshIntervalSeconds, 300, 'default refresh interval is 5 minutes');
assertEqual(DEFAULT_CONFIG.refreshPaused, false, 'default refresh pause is false');

for (const seconds of [60, 300, 1800])
    assertEqual(normalizeConfig({refreshIntervalSeconds: seconds}).refreshIntervalSeconds, seconds, `${seconds} seconds accepted`);

assertEqual(normalizeConfig({refreshIntervalSeconds: 59}).refreshIntervalSeconds, 60, 'low out-of-range interval clamps to 60 seconds');
assertEqual(normalizeConfig({refreshIntervalSeconds: 1801}).refreshIntervalSeconds, 1800, 'high out-of-range interval clamps to 1800 seconds');
assertEqual(normalizeConfig({refreshIntervalSeconds: Number.NaN}).refreshIntervalSeconds, 300, 'non-finite interval falls back to default');

assertEqual(refreshIntervalSecondsToMinutes(60), 1, '60 seconds displays as 1 minute');
assertEqual(refreshIntervalSecondsToMinutes(300), 5, '300 seconds displays as 5 minutes');
assertEqual(refreshIntervalSecondsToMinutes(1800), 30, '1800 seconds displays as 30 minutes');
assertEqual(refreshIntervalSecondsToMinutes(59), 1, '59 seconds displays as nearest allowed minute');
assertEqual(refreshIntervalSecondsToMinutes(1801), 30, '1801 seconds displays as nearest allowed minute');

assertEqual(refreshIntervalMinutesToSeconds(1), 60, '1 minute stores as 60 seconds');
assertEqual(refreshIntervalMinutesToSeconds(5), 300, '5 minutes stores as 300 seconds');
assertEqual(refreshIntervalMinutesToSeconds(30), 1800, '30 minutes stores as 1800 seconds');
assertEqual(refreshIntervalMinutesToSeconds(0), 60, 'minutes below range clamp to 60 seconds');
assertEqual(refreshIntervalMinutesToSeconds(31), 1800, 'minutes above range clamp to 1800 seconds');
assertEqual(refreshIntervalMinuteLabel(1), '1 minute', '1 minute label');
assertEqual(refreshIntervalMinuteLabel(5), '5 minutes', '5 minute label');
assertEqual(refreshIntervalMinuteLabel(30), '30 minutes', '30 minute label');

const config = configFromSettings(new FakeSettings({
    'refresh-interval-seconds': 1800,
    'refresh-paused': true,
}));
assertEqual(config.refreshIntervalSeconds, 1800, 'configFromSettings reads refresh interval');
assertEqual(config.refreshPaused, true, 'configFromSettings reads refresh pause');

const settings = new FakeSettings();
connectSettings(settings, () => {});
assert(settings.connectedSignals.includes('changed::refresh-interval-seconds'), 'connectSettings watches refresh interval');
assert(settings.connectedSignals.includes('changed::refresh-paused'), 'connectSettings watches refresh pause');

print('settings tests passed');
