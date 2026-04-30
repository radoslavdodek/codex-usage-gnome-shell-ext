export const SCHEMA_VERSION = 1;

export const SOURCE_KINDS = Object.freeze({
    MOCK: 'mock',
    CODEX_APP_SERVER: 'codex-app-server',
});

export const BUCKET_KEYS = Object.freeze({
    FIVE_HOUR: 'five-hour',
    WEEKLY: 'weekly',
});

export const OVERALL_STATUSES = Object.freeze({
    LOADING: 'loading',
    NORMAL: 'normal',
    WARNING: 'warning',
    LIMIT_REACHED: 'limit-reached',
    STALE: 'stale',
    NOT_AUTHENTICATED: 'not-authenticated',
    NOT_CONFIGURED: 'not-configured',
    ERROR: 'error',
});

export const BUCKET_STATUSES = Object.freeze({
    NORMAL: 'normal',
    WARNING: 'warning',
    LIMIT_REACHED: 'limit-reached',
    STALE: 'stale',
    UNAVAILABLE: 'unavailable',
    ERROR: 'error',
});

export const REFRESH_STATES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    REFRESHING: 'refreshing',
    SUCCESSFUL: 'successful',
    FAILED_WITH_PREVIOUS: 'failed-with-previous',
    NOT_AUTHENTICATED: 'not-authenticated',
    WRONG_AUTH_MODE: 'wrong-auth-mode',
    NOT_CONFIGURED: 'not-configured',
    RATE_LIMITED: 'rate-limited',
    TIMED_OUT: 'timed-out',
    MALFORMED: 'malformed',
    CANCELED: 'canceled',
});

export const DEFAULT_LABELS = Object.freeze({
    [BUCKET_KEYS.FIVE_HOUR]: '5-hour usage limit',
    [BUCKET_KEYS.WEEKLY]: 'Weekly usage limit',
});

const DEFAULT_AUTH_CONTEXT = Object.freeze({
    mode: 'unknown',
    apiKeyUsed: false,
    credentialLocation: 'unknown',
    workspaceSelection: 'default-context',
    message: null,
});

const FAILURE_STATUS_BY_KIND = Object.freeze({
    [REFRESH_STATES.NOT_AUTHENTICATED]: OVERALL_STATUSES.NOT_AUTHENTICATED,
    [REFRESH_STATES.WRONG_AUTH_MODE]: OVERALL_STATUSES.NOT_AUTHENTICATED,
    [REFRESH_STATES.NOT_CONFIGURED]: OVERALL_STATUSES.NOT_CONFIGURED,
    [REFRESH_STATES.RATE_LIMITED]: OVERALL_STATUSES.ERROR,
    [REFRESH_STATES.TIMED_OUT]: OVERALL_STATUSES.ERROR,
    [REFRESH_STATES.MALFORMED]: OVERALL_STATUSES.ERROR,
    [REFRESH_STATES.CANCELED]: OVERALL_STATUSES.ERROR,
});

export function unixNow() {
    return Math.floor(Date.now() / 1000);
}

export function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

export function normalizePercent(value) {
    if (typeof value === 'string' && value.trim() !== '')
        value = Number(value);
    if (!isFiniteNumber(value))
        return null;
    return Math.max(0, Math.min(100, Math.round(value)));
}

export function bucketStatusForPercent(percentRemaining, warningThresholdPercent = 25) {
    const percent = normalizePercent(percentRemaining);
    if (percent === null)
        return BUCKET_STATUSES.UNAVAILABLE;
    if (percent <= 0)
        return BUCKET_STATUSES.LIMIT_REACHED;
    if (percent <= warningThresholdPercent)
        return BUCKET_STATUSES.WARNING;
    return BUCKET_STATUSES.NORMAL;
}

export function createAuthContext(overrides = {}) {
    const context = {...DEFAULT_AUTH_CONTEXT, ...overrides};
    const allowedModes = new Set(['chatgpt', 'api-key', 'missing', 'unknown']);
    if (!allowedModes.has(context.mode))
        context.mode = 'unknown';
    context.apiKeyUsed = Boolean(context.apiKeyUsed);
    return context;
}

export function createBucket(key, overrides = {}, options = {}) {
    const warningThresholdPercent = options.warningThresholdPercent ?? 25;
    const percentRemaining = normalizePercent(overrides.percentRemaining);
    let status = overrides.status;

    if (!status)
        status = bucketStatusForPercent(percentRemaining, warningThresholdPercent);

    if (!Object.values(BUCKET_STATUSES).includes(status))
        status = percentRemaining === null ? BUCKET_STATUSES.UNAVAILABLE : bucketStatusForPercent(percentRemaining, warningThresholdPercent);

    return {
        key,
        label: overrides.label ?? DEFAULT_LABELS[key] ?? key,
        percentRemaining,
        resetAtUnix: normalizeUnixTimestamp(overrides.resetAtUnix),
        resetText: typeof overrides.resetText === 'string' && overrides.resetText.trim() ? overrides.resetText.trim() : null,
        status,
        message: typeof overrides.message === 'string' && overrides.message.trim() ? overrides.message.trim() : null,
    };
}

export function normalizeUnixTimestamp(value) {
    if (value === null || value === undefined || value === '')
        return null;
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (Number.isFinite(numeric))
            value = numeric;
        else {
            const parsed = Date.parse(value);
            if (!Number.isFinite(parsed))
                return null;
            return Math.floor(parsed / 1000);
        }
    }
    if (!isFiniteNumber(value))
        return null;
    if (value > 100000000000)
        return Math.floor(value / 1000);
    return Math.floor(value);
}

export function getAvailableBuckets(snapshot) {
    return [snapshot?.fiveHour, snapshot?.weekly].filter(bucket =>
        bucket && bucket.percentRemaining !== null &&
        bucket.status !== BUCKET_STATUSES.UNAVAILABLE &&
        bucket.status !== BUCKET_STATUSES.ERROR);
}

export function selectPriorityBucket(snapshot, bucketPriority = 'lowest') {
    if (!snapshot)
        return null;
    if (bucketPriority === 'five-hour')
        return snapshot.fiveHour ?? null;
    if (bucketPriority === 'weekly')
        return snapshot.weekly ?? null;

    const available = getAvailableBuckets(snapshot);
    if (available.length === 0)
        return snapshot.fiveHour ?? snapshot.weekly ?? null;

    return available.reduce((lowest, bucket) => {
        if (!lowest)
            return bucket;
        return bucket.percentRemaining < lowest.percentRemaining ? bucket : lowest;
    }, null);
}

export function deriveOverallStatus(snapshot, options = {}) {
    const warningThresholdPercent = options.warningThresholdPercent ?? 25;
    const explicit = snapshot?.overallStatus;
    if ([OVERALL_STATUSES.LOADING, OVERALL_STATUSES.STALE, OVERALL_STATUSES.NOT_AUTHENTICATED, OVERALL_STATUSES.NOT_CONFIGURED, OVERALL_STATUSES.ERROR].includes(explicit))
        return explicit;

    const bucket = selectPriorityBucket(snapshot, options.bucketPriority ?? 'lowest');
    if (!bucket || bucket.percentRemaining === null) {
        const buckets = [snapshot?.fiveHour, snapshot?.weekly].filter(Boolean);
        if (buckets.some(item => item.status === BUCKET_STATUSES.ERROR))
            return OVERALL_STATUSES.ERROR;
        return OVERALL_STATUSES.ERROR;
    }

    const status = bucketStatusForPercent(bucket.percentRemaining, warningThresholdPercent);
    if (status === BUCKET_STATUSES.LIMIT_REACHED)
        return OVERALL_STATUSES.LIMIT_REACHED;
    if (status === BUCKET_STATUSES.WARNING)
        return OVERALL_STATUSES.WARNING;
    return OVERALL_STATUSES.NORMAL;
}

export function createSnapshot(fields = {}, options = {}) {
    const now = options.nowUnix ?? fields.generatedAtUnix ?? unixNow();
    const refreshIntervalSeconds = options.refreshIntervalSeconds ?? 1800;
    const warningThresholdPercent = options.warningThresholdPercent ?? 25;
    const lastSuccessfulUpdateUnix = normalizeUnixTimestamp(fields.lastSuccessfulUpdateUnix);
    const generatedAtUnix = normalizeUnixTimestamp(now) ?? unixNow();
    const staleAfterUnix = normalizeUnixTimestamp(fields.staleAfterUnix) ??
        (lastSuccessfulUpdateUnix ? lastSuccessfulUpdateUnix + (2 * refreshIntervalSeconds) : null);

    const snapshot = {
        schemaVersion: SCHEMA_VERSION,
        sourceId: fields.sourceId ?? SOURCE_KINDS.MOCK,
        sourceAuth: createAuthContext(fields.sourceAuth),
        overallStatus: fields.overallStatus ?? null,
        displayText: fields.displayText ?? '',
        detailText: fields.detailText ?? '',
        fiveHour: createBucket(BUCKET_KEYS.FIVE_HOUR, fields.fiveHour ?? {}, {warningThresholdPercent}),
        weekly: createBucket(BUCKET_KEYS.WEEKLY, fields.weekly ?? {}, {warningThresholdPercent}),
        lastSuccessfulUpdateUnix,
        generatedAtUnix,
        staleAfterUnix,
        errorMessage: fields.errorMessage ?? null,
        rawErrorKind: fields.rawErrorKind ?? null,
    };

    snapshot.overallStatus = deriveOverallStatus(snapshot, {
        warningThresholdPercent,
        bucketPriority: options.bucketPriority ?? 'lowest',
    });

    return snapshot;
}

export function createLoadingSnapshot(options = {}) {
    const now = options.nowUnix ?? unixNow();
    return createSnapshot({
        sourceId: options.sourceId ?? SOURCE_KINDS.MOCK,
        overallStatus: OVERALL_STATUSES.LOADING,
        sourceAuth: options.sourceAuth ?? {mode: 'unknown', apiKeyUsed: false},
        fiveHour: {status: BUCKET_STATUSES.UNAVAILABLE, message: 'Loading'},
        weekly: {status: BUCKET_STATUSES.UNAVAILABLE, message: 'Loading'},
        generatedAtUnix: now,
    }, options);
}

export function createFailureSnapshot(kind, message, options = {}) {
    const now = options.nowUnix ?? unixNow();
    const overallStatus = FAILURE_STATUS_BY_KIND[kind] ?? OVERALL_STATUSES.ERROR;
    const bucketStatus = overallStatus === OVERALL_STATUSES.STALE ? BUCKET_STATUSES.STALE : BUCKET_STATUSES.UNAVAILABLE;

    return createSnapshot({
        sourceId: options.sourceId ?? SOURCE_KINDS.CODEX_APP_SERVER,
        sourceAuth: createAuthContext(options.sourceAuth ?? {mode: kind === REFRESH_STATES.WRONG_AUTH_MODE ? 'api-key' : 'unknown'}),
        overallStatus,
        fiveHour: {status: bucketStatus, message},
        weekly: {status: bucketStatus, message},
        generatedAtUnix: now,
        errorMessage: message,
        rawErrorKind: kind,
    }, options);
}

export function isSuccessfulSnapshot(snapshot) {
    return [OVERALL_STATUSES.NORMAL, OVERALL_STATUSES.WARNING, OVERALL_STATUSES.LIMIT_REACHED].includes(snapshot?.overallStatus);
}

export function shouldMarkStale(snapshot, nowUnix = unixNow()) {
    return Boolean(snapshot?.staleAfterUnix && nowUnix > snapshot.staleAfterUnix);
}

export function markSnapshotStale(snapshot, message = 'Last successful data is stale.', nowUnix = unixNow()) {
    if (!snapshot)
        return null;

    const copyBucket = bucket => ({
        ...bucket,
        status: bucket.percentRemaining === null ? BUCKET_STATUSES.UNAVAILABLE : BUCKET_STATUSES.STALE,
        message: bucket.message ?? message,
    });

    return {
        ...snapshot,
        overallStatus: OVERALL_STATUSES.STALE,
        detailText: message,
        errorMessage: message,
        generatedAtUnix: nowUnix,
        fiveHour: copyBucket(snapshot.fiveHour),
        weekly: copyBucket(snapshot.weekly),
    };
}
