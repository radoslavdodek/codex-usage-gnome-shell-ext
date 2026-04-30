import {BalanceSource} from './balanceSource.js';
import {
    BUCKET_STATUSES,
    OVERALL_STATUSES,
    REFRESH_STATES,
    SOURCE_KINDS,
    createFailureSnapshot,
    createSnapshot,
    markSnapshotStale,
    unixNow,
} from './model.js';
import {withDisplayFields} from './formatter.js';

const BASE_TIME = 1770000000;

const SCENARIOS = Object.freeze({
    loading: {
        overallStatus: OVERALL_STATUSES.LOADING,
        fiveHour: {status: BUCKET_STATUSES.UNAVAILABLE, message: 'Loading'},
        weekly: {status: BUCKET_STATUSES.UNAVAILABLE, message: 'Loading'},
    },
    normal: {
        fiveHour: {percentRemaining: 87, resetAtUnix: BASE_TIME + 3600},
        weekly: {percentRemaining: 95, resetAtUnix: BASE_TIME + 86400},
    },
    warning: {
        fiveHour: {percentRemaining: 20, resetAtUnix: BASE_TIME + 1800},
        weekly: {percentRemaining: 95, resetAtUnix: BASE_TIME + 86400},
    },
    'limit-reached': {
        fiveHour: {percentRemaining: 0, resetAtUnix: BASE_TIME + 900},
        weekly: {percentRemaining: 67, resetAtUnix: BASE_TIME + 86400},
    },
    stale: {
        overallStatus: OVERALL_STATUSES.STALE,
        fiveHour: {percentRemaining: 42, status: BUCKET_STATUSES.STALE, resetAtUnix: BASE_TIME + 900},
        weekly: {percentRemaining: 88, status: BUCKET_STATUSES.STALE, resetAtUnix: BASE_TIME + 86400},
        errorMessage: 'Last successful data is stale.',
    },
    unavailable: {
        fiveHour: {status: BUCKET_STATUSES.UNAVAILABLE, message: '5-hour data unavailable'},
        weekly: {percentRemaining: 91, resetText: 'later today'},
    },
    error: {
        overallStatus: OVERALL_STATUSES.ERROR,
        fiveHour: {status: BUCKET_STATUSES.ERROR, message: 'Mock provider error'},
        weekly: {status: BUCKET_STATUSES.ERROR, message: 'Mock provider error'},
        errorMessage: 'Mock provider error',
        rawErrorKind: REFRESH_STATES.MALFORMED,
    },
});

export function buildMockSnapshot(scenario = 'normal', options = {}) {
    const now = options.nowUnix ?? unixNow();

    if (scenario === 'not-authenticated')
        return withDisplayFields(createFailureSnapshot(REFRESH_STATES.NOT_AUTHENTICATED, 'Sign in to Codex with ChatGPT.', {sourceId: SOURCE_KINDS.MOCK, nowUnix: now}), options);
    if (scenario === 'not-configured')
        return withDisplayFields(createFailureSnapshot(REFRESH_STATES.NOT_CONFIGURED, 'Configure the Codex command path.', {sourceId: SOURCE_KINDS.MOCK, nowUnix: now}), options);
    if (scenario === 'rate-limited')
        return withDisplayFields(createFailureSnapshot(REFRESH_STATES.RATE_LIMITED, 'The source is rate limited. Try again later.', {sourceId: SOURCE_KINDS.MOCK, nowUnix: now}), options);
    if (scenario === 'timeout')
        return withDisplayFields(createFailureSnapshot(REFRESH_STATES.TIMED_OUT, 'The source timed out.', {sourceId: SOURCE_KINDS.MOCK, nowUnix: now}), options);

    const data = SCENARIOS[scenario] ?? SCENARIOS.normal;
    const snapshot = createSnapshot({
        sourceId: SOURCE_KINDS.MOCK,
        sourceAuth: {mode: 'chatgpt', apiKeyUsed: false, credentialLocation: 'helper-managed'},
        generatedAtUnix: now,
        lastSuccessfulUpdateUnix: data.overallStatus === OVERALL_STATUSES.LOADING || data.overallStatus === OVERALL_STATUSES.ERROR ? null : now,
        ...data,
    }, options);

    if (scenario === 'stale')
        return withDisplayFields(markSnapshotStale(snapshot, 'Last successful data is stale.', now), options);

    return withDisplayFields(snapshot, options);
}

export class MockBalanceSource extends BalanceSource {
    constructor(config = {}) {
        super(config);
        this._scenario = config.mockScenario ?? 'normal';
    }

    get id() {
        return SOURCE_KINDS.MOCK;
    }

    refresh(_cancellable, options = {}) {
        if (this._activeRefresh)
            return this._activeRefresh;

        this._status = this._lastSnapshot ? REFRESH_STATES.REFRESHING : REFRESH_STATES.LOADING;
        this._activeRefresh = Promise.resolve().then(() => {
            const snapshot = buildMockSnapshot(this._scenario, {...this._config, ...options});
            this._lastSnapshot = snapshot;
            this._status = REFRESH_STATES.SUCCESSFUL;
            return snapshot;
        }).finally(() => {
            this._activeRefresh = null;
        });
        return this._activeRefresh;
    }
}
