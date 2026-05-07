import {SOURCE_KINDS} from './model.js';

export const SETTINGS_SCHEMA_ID = 'org.gnome.shell.extensions.codex-usage';
export const MIN_REFRESH_INTERVAL_SECONDS = 60;
export const MAX_REFRESH_INTERVAL_SECONDS = 1800;
export const DEFAULT_REFRESH_INTERVAL_SECONDS = 300;
export const MIN_REFRESH_INTERVAL_MINUTES = 1;
export const MAX_REFRESH_INTERVAL_MINUTES = 30;

export const DEFAULT_CONFIG = Object.freeze({
    sourceKind: SOURCE_KINDS.CODEX_APP_SERVER,
    mockScenario: 'normal',
    codexCommand: 'codex',
    refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
    refreshPaused: false,
    timeoutSeconds: 15,
    warningThresholdPercent: 25,
    bucketPriority: 'lowest',
    displayFormat: 'bucket-percent',
    requireChatGptAuth: true,
    allowApiKeyAuth: false,
});

const SOURCE_KINDS_ALLOWED = new Set([SOURCE_KINDS.MOCK, SOURCE_KINDS.CODEX_APP_SERVER]);
const MOCK_SCENARIOS_ALLOWED = new Set(['loading', 'normal', 'warning', 'limit-reached', 'stale', 'unavailable', 'error', 'not-authenticated', 'not-configured', 'rate-limited', 'timeout']);
const DISPLAY_FORMATS_ALLOWED = new Set(['bucket-percent', 'percent-only', 'state-label']);
const BUCKET_PRIORITIES_ALLOWED = new Set(['lowest', 'five-hour', 'weekly']);

function safeString(value, fallback) {
    if (typeof value !== 'string')
        return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
}

function safeInt(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    const intValue = Math.floor(number);
    if (intValue < min || intValue > max)
        return fallback;
    return intValue;
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(max, number));
}

export function refreshIntervalSecondsToMinutes(value) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return DEFAULT_REFRESH_INTERVAL_SECONDS / 60;

    const seconds = clamp(number, MIN_REFRESH_INTERVAL_SECONDS, MAX_REFRESH_INTERVAL_SECONDS);
    return clamp(Math.round(seconds / 60), MIN_REFRESH_INTERVAL_MINUTES, MAX_REFRESH_INTERVAL_MINUTES);
}

export function refreshIntervalMinutesToSeconds(value) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return DEFAULT_REFRESH_INTERVAL_SECONDS;

    const minutes = clamp(Math.round(number), MIN_REFRESH_INTERVAL_MINUTES, MAX_REFRESH_INTERVAL_MINUTES);
    return minutes * 60;
}

export function refreshIntervalMinuteLabel(value) {
    const minutes = refreshIntervalSecondsToMinutes(refreshIntervalMinutesToSeconds(value));
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

export function normalizeRefreshIntervalSeconds(value) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return DEFAULT_REFRESH_INTERVAL_SECONDS;

    return refreshIntervalMinutesToSeconds(refreshIntervalSecondsToMinutes(number));
}

export function shouldStartRefresh(config = {}) {
    return !Boolean(config.refreshPaused);
}

export function normalizeConfig(input = {}) {
    const sourceKind = SOURCE_KINDS_ALLOWED.has(input.sourceKind) ? input.sourceKind : DEFAULT_CONFIG.sourceKind;
    const mockScenario = MOCK_SCENARIOS_ALLOWED.has(input.mockScenario) ? input.mockScenario : DEFAULT_CONFIG.mockScenario;
    const displayFormat = DISPLAY_FORMATS_ALLOWED.has(input.displayFormat) ? input.displayFormat : DEFAULT_CONFIG.displayFormat;
    const bucketPriority = BUCKET_PRIORITIES_ALLOWED.has(input.bucketPriority) ? input.bucketPriority : DEFAULT_CONFIG.bucketPriority;
    const refreshIntervalSeconds = normalizeRefreshIntervalSeconds(input.refreshIntervalSeconds ?? DEFAULT_CONFIG.refreshIntervalSeconds);
    let timeoutSeconds = safeInt(input.timeoutSeconds, DEFAULT_CONFIG.timeoutSeconds, 5, 300);

    if (timeoutSeconds >= refreshIntervalSeconds)
        timeoutSeconds = DEFAULT_CONFIG.timeoutSeconds;

    return {
        sourceKind,
        mockScenario,
        codexCommand: safeString(input.codexCommand, DEFAULT_CONFIG.codexCommand),
        refreshIntervalSeconds,
        refreshPaused: Boolean(input.refreshPaused ?? DEFAULT_CONFIG.refreshPaused),
        timeoutSeconds,
        warningThresholdPercent: safeInt(input.warningThresholdPercent, DEFAULT_CONFIG.warningThresholdPercent, 1, 99),
        bucketPriority,
        displayFormat,
        requireChatGptAuth: input.requireChatGptAuth ?? true,
        allowApiKeyAuth: input.allowApiKeyAuth ?? false,
    };
}

export function configFromSettings(settings) {
    if (!settings)
        return normalizeConfig();

    return normalizeConfig({
        sourceKind: settings.get_string('source-kind'),
        mockScenario: settings.get_string('mock-scenario'),
        codexCommand: settings.get_string('codex-command'),
        refreshIntervalSeconds: settings.get_int('refresh-interval-seconds'),
        refreshPaused: settings.get_boolean('refresh-paused'),
        timeoutSeconds: settings.get_int('timeout-seconds'),
        warningThresholdPercent: settings.get_int('warning-threshold-percent'),
        displayFormat: settings.get_string('display-format'),
        bucketPriority: settings.get_string('bucket-priority'),
    });
}

export function connectSettings(settings, callback) {
    if (!settings)
        return [];

    const keys = [
        'source-kind',
        'mock-scenario',
        'codex-command',
        'refresh-interval-seconds',
        'refresh-paused',
        'timeout-seconds',
        'warning-threshold-percent',
        'display-format',
        'bucket-priority',
    ];

    return keys.map(key => settings.connect(`changed::${key}`, callback));
}

export function disconnectSettings(settings, signalIds) {
    if (!settings || !signalIds)
        return;
    for (const id of signalIds) {
        if (id)
            settings.disconnect(id);
    }
}
