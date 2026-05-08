import {
    derivePanelDisplayText,
    formatBucketRow,
    formatLastRefresh,
    formatReset,
    withDisplayFields,
} from '../lib/formatter.js';
import {
    BUCKET_STATUSES,
    OVERALL_STATUSES,
    createFailureSnapshot,
    createSnapshot,
    markSnapshotStale,
} from '../lib/model.js';

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected)
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

const baseOptions = {
    nowUnix: 1770000000,
    warningThresholdPercent: 25,
    refreshIntervalSeconds: 1800,
    bucketPriority: 'lowest',
    displayFormat: 'bucket-percent',
};

const normal = withDisplayFields(createSnapshot({
    sourceId: 'mock',
    sourceAuth: {mode: 'chatgpt', apiKeyUsed: false},
    fiveHour: {percentRemaining: 87, resetAtUnix: 1770003600},
    weekly: {percentRemaining: 95, resetAtUnix: 1770300000},
    lastSuccessfulUpdateUnix: 1770000000,
}, baseOptions), baseOptions);

assertEqual(normal.overallStatus, OVERALL_STATUSES.NORMAL, 'normal status');
assertEqual(normal.displayText, '5h 87%', 'lowest bucket panel text');

const warning = withDisplayFields(createSnapshot({
    sourceId: 'mock',
    sourceAuth: {mode: 'chatgpt', apiKeyUsed: false},
    fiveHour: {percentRemaining: 20},
    weekly: {percentRemaining: 95},
    lastSuccessfulUpdateUnix: 1770000000,
}, baseOptions), baseOptions);

assertEqual(warning.overallStatus, OVERALL_STATUSES.WARNING, 'warning status');
assertEqual(derivePanelDisplayText(warning, {...baseOptions, displayFormat: 'state-label'}), 'Codex Low', 'state label format');
assertEqual(derivePanelDisplayText(warning, {...baseOptions, displayFormat: 'percent-only'}), '20%', 'percent-only format');

const limit = withDisplayFields(createSnapshot({
    sourceId: 'mock',
    sourceAuth: {mode: 'chatgpt', apiKeyUsed: false},
    fiveHour: {percentRemaining: 0},
    weekly: {percentRemaining: 95},
    lastSuccessfulUpdateUnix: 1770000000,
}, baseOptions), baseOptions);

assertEqual(limit.overallStatus, OVERALL_STATUSES.LIMIT_REACHED, 'limit reached status');
assertEqual(limit.displayText, '5h 0%', 'limit text');

const weeklyPriority = withDisplayFields(normal, {...baseOptions, bucketPriority: 'weekly'});
assertEqual(weeklyPriority.displayText, 'Week 95%', 'weekly priority text');

const partial = withDisplayFields(createSnapshot({
    sourceId: 'mock',
    sourceAuth: {mode: 'chatgpt', apiKeyUsed: false},
    fiveHour: {status: BUCKET_STATUSES.UNAVAILABLE, message: 'Unavailable'},
    weekly: {percentRemaining: 64, resetText: 'tomorrow'},
    lastSuccessfulUpdateUnix: 1770000000,
}, baseOptions), baseOptions);

assertEqual(partial.displayText, 'Week 64%', 'partial bucket panel text');
const weeklyRow = formatBucketRow(partial.weekly);
assertEqual(weeklyRow.value, '64%', 'bucket row percent');
assertEqual(weeklyRow.reset, 'Resets tomorrow', 'fallback reset text');
assertEqual(formatReset(partial.fiveHour), 'Reset unavailable', 'unavailable reset text');
assert(formatLastRefresh(1770000000).startsWith('Last refresh '), 'last refresh format');

const countdownNow = 1770000000;
assertEqual(formatReset({resetAtUnix: countdownNow + 60}, {nowUnix: countdownNow}), 'Resets in 1 minute', 'one minute countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (2 * 60 * 60) + (15 * 60)}, {nowUnix: countdownNow}), 'Resets in 2h 15m', 'hour and minute countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + 30}, {nowUnix: countdownNow}), 'Resets in less than 1 minute', 'sub-minute countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (60 * 60)}, {nowUnix: countdownNow}), 'Resets in 1h', 'one hour countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (3 * 60 * 60)}, {nowUnix: countdownNow}), 'Resets in 3h', 'whole hour countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (2 * 24 * 60 * 60) + (13 * 60 * 60) + (15 * 60)}, {nowUnix: countdownNow}), 'Resets in 2d 13h 15m', 'multi-day countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (2 * 24 * 60 * 60)}, {nowUnix: countdownNow}), 'Resets in 2d', 'whole-day countdown');
assertEqual(formatReset({resetAtUnix: countdownNow + (2 * 24 * 60 * 60) + (4 * 60 * 60)}, {nowUnix: countdownNow}), 'Resets in 2d 4h', 'days and hours countdown');
assertEqual(formatReset({resetAtUnix: countdownNow}, {nowUnix: countdownNow}), 'Reset due', 'due now reset');
assertEqual(formatReset({resetAtUnix: countdownNow - 1}, {nowUnix: countdownNow}), 'Reset due', 'elapsed reset');
assertEqual(formatReset(null, {nowUnix: countdownNow}), 'Reset unavailable', 'missing bucket reset text');
assertEqual(formatReset({}, {nowUnix: countdownNow}), 'Reset unavailable', 'missing reset timestamp');
assertEqual(formatReset({resetText: 'tomorrow'}, {nowUnix: countdownNow}), 'Resets tomorrow', 'fallback reset text without timestamp');

const fiveHourCountdownRow = formatBucketRow({
    label: '5-hour usage limit',
    percentRemaining: 87,
    resetAtUnix: countdownNow + (2 * 60 * 60) + (15 * 60),
    status: BUCKET_STATUSES.NORMAL,
}, {nowUnix: countdownNow});
assertEqual(fiveHourCountdownRow.reset, 'Resets in 2h 15m', 'bucket row relative reset text');

const weeklyCountdownRow = formatBucketRow({
    label: 'Weekly usage limit',
    percentRemaining: 95,
    resetAtUnix: countdownNow + (2 * 24 * 60 * 60) + (13 * 60 * 60) + (15 * 60),
    status: BUCKET_STATUSES.NORMAL,
}, {nowUnix: countdownNow});
assertEqual(weeklyCountdownRow.reset, 'Resets in 2d 13h 15m', 'weekly bucket row relative reset text');

const staleCountdownRow = formatBucketRow({
    label: '5-hour usage limit',
    percentRemaining: 87,
    resetAtUnix: countdownNow - 60,
    status: BUCKET_STATUSES.STALE,
}, {nowUnix: countdownNow});
assertEqual(staleCountdownRow.reset, 'Reset due', 'stale elapsed bucket reset text');

const stale = withDisplayFields(markSnapshotStale(normal, 'Previous data is stale.', 1770007201), baseOptions);
assertEqual(stale.overallStatus, OVERALL_STATUSES.STALE, 'stale status');
assertEqual(stale.fiveHour.status, BUCKET_STATUSES.STALE, 'stale bucket status');
assertEqual(stale.displayText, '5h 87%', 'stale keeps previous compact value');

const authFailure = withDisplayFields(createFailureSnapshot('wrong-auth-mode', 'Sign in with ChatGPT.', {sourceId: 'codex-app-server', nowUnix: 1770000000}), baseOptions);
assertEqual(authFailure.overallStatus, OVERALL_STATUSES.NOT_AUTHENTICATED, 'wrong auth maps to not-authenticated');
assertEqual(authFailure.displayText, 'Codex Sign in', 'auth failure panel text');

print('formatter tests passed');
