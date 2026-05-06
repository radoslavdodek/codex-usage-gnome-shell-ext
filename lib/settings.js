import {SOURCE_KINDS} from './model.js';

export const SETTINGS_SCHEMA_ID = 'org.gnome.shell.extensions.codex-usage';

export const DEFAULT_CONFIG = Object.freeze({
    sourceKind: SOURCE_KINDS.CODEX_APP_SERVER,
    mockScenario: 'normal',
    codexCommand: 'codex',
    refreshIntervalSeconds: 1800,
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
    if (!Number.isFinite(value))
        return fallback;
    const intValue = Math.floor(value);
    if (intValue < min || intValue > max)
        return fallback;
    return intValue;
}

export function normalizeConfig(input = {}) {
    const sourceKind = SOURCE_KINDS_ALLOWED.has(input.sourceKind) ? input.sourceKind : DEFAULT_CONFIG.sourceKind;
    const mockScenario = MOCK_SCENARIOS_ALLOWED.has(input.mockScenario) ? input.mockScenario : DEFAULT_CONFIG.mockScenario;
    const displayFormat = DISPLAY_FORMATS_ALLOWED.has(input.displayFormat) ? input.displayFormat : DEFAULT_CONFIG.displayFormat;
    const bucketPriority = BUCKET_PRIORITIES_ALLOWED.has(input.bucketPriority) ? input.bucketPriority : DEFAULT_CONFIG.bucketPriority;
    const refreshIntervalSeconds = safeInt(input.refreshIntervalSeconds, DEFAULT_CONFIG.refreshIntervalSeconds, 300, 86400);
    let timeoutSeconds = safeInt(input.timeoutSeconds, DEFAULT_CONFIG.timeoutSeconds, 5, 300);

    if (timeoutSeconds >= refreshIntervalSeconds)
        timeoutSeconds = DEFAULT_CONFIG.timeoutSeconds;

    return {
        sourceKind,
        mockScenario,
        codexCommand: safeString(input.codexCommand, DEFAULT_CONFIG.codexCommand),
        refreshIntervalSeconds,
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
