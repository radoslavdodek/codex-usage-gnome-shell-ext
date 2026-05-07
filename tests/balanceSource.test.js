import {ProviderError} from '../lib/balanceSource.js';
import {
    buildJsonRpcInput,
    normalizeCodexRateLimitsPayload,
    parseAuthStatusOutput,
    parseJsonRpcOutput,
    subprocessPathForCommand,
} from '../lib/codexAppServerSource.js';
import {
    BUCKET_STATUSES,
    OVERALL_STATUSES,
    REFRESH_STATES,
    createFailureSnapshot,
    shouldMarkStale,
} from '../lib/model.js';
import {MockBalanceSource} from '../lib/mockSource.js';
import {normalizeConfig} from '../lib/settings.js';
import {withDisplayFields} from '../lib/formatter.js';

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected)
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

const options = {
    nowUnix: 1770000000,
    warningThresholdPercent: 25,
    refreshIntervalSeconds: 1800,
    bucketPriority: 'lowest',
    displayFormat: 'bucket-percent',
};

const successPayload = {
    rateLimitsByLimitId: {
        codex: {
            limitId: 'codex',
            primary: {
                windowDurationMins: 300,
                usedPercent: 13,
                resetsAt: '2026-02-02T10:00:00Z',
            },
            secondary: {
                windowDurationMins: 10080,
                usedPercent: 5,
                resetsAt: '2026-02-08T10:00:00Z',
            },
        },
    },
};

const normalized = normalizeCodexRateLimitsPayload(successPayload, options);
assertEqual(normalized.sourceId, 'codex-app-server', 'source id');
assertEqual(normalized.sourceAuth.mode, 'chatgpt', 'chatgpt auth context');
assertEqual(normalized.sourceAuth.apiKeyUsed, false, 'api key not used');
assertEqual(normalized.fiveHour.percentRemaining, 87, 'primary maps to five-hour percent remaining');
assertEqual(normalized.weekly.percentRemaining, 95, 'secondary maps to weekly percent remaining');
assertEqual(normalized.overallStatus, OVERALL_STATUSES.NORMAL, 'normal overall status');
assertEqual(normalized.displayText, '5h 87%', 'display text from normalized payload');

const fallbackPayload = {
    rateLimits: [
        {limitId: 'other'},
        {
            limitId: 'codex',
            primary: {windowDurationMins: 300, usedPercent: 80},
            secondary: {windowDurationMins: 10080, usedPercent: 10},
        },
    ],
};
const fallback = normalizeCodexRateLimitsPayload(fallbackPayload, options);
assertEqual(fallback.fiveHour.percentRemaining, 20, 'limitId fallback primary mapping');
assertEqual(fallback.overallStatus, OVERALL_STATUSES.WARNING, 'warning threshold mapping');

const partial = normalizeCodexRateLimitsPayload({
    rateLimitsByLimitId: {
        codex: {
            limitId: 'codex',
            primary: {windowDurationMins: 300, usedPercent: 25},
        },
    },
}, options);
assertEqual(partial.fiveHour.percentRemaining, 75, 'partial source keeps valid bucket');
assertEqual(partial.weekly.status, BUCKET_STATUSES.UNAVAILABLE, 'partial source marks missing weekly unavailable');
assertEqual(partial.displayText, '5h 75%', 'partial source uses available bucket');

const malformedBucket = normalizeCodexRateLimitsPayload({
    rateLimitsByLimitId: {
        codex: {
            limitId: 'codex',
            primary: {windowDurationMins: 300, usedPercent: 'nope'},
            secondary: {windowDurationMins: 10080, usedPercent: 40},
        },
    },
}, options);
assertEqual(malformedBucket.fiveHour.status, BUCKET_STATUSES.ERROR, 'malformed bucket status');
assertEqual(malformedBucket.weekly.percentRemaining, 60, 'valid sibling bucket preserved');
assertEqual(malformedBucket.overallStatus, OVERALL_STATUSES.ERROR, 'malformed sibling keeps overall error state');
assertEqual(malformedBucket.displayText, 'Codex Error', 'malformed sibling panel text');

const rpcText = [
    JSON.stringify({id: 1, result: {ok: true}}),
    JSON.stringify({id: 2, result: successPayload}),
].join('\n');
assertEqual(parseJsonRpcOutput(rpcText).rateLimitsByLimitId.codex.limitId, 'codex', 'JSON-RPC parse success');
assert(buildJsonRpcInput().includes('account/rateLimits/read'), 'JSON-RPC input requests rate limits');
assert(buildJsonRpcInput().includes('"method":"initialized"'), 'JSON-RPC input sends initialized notification');

try {
    parseJsonRpcOutput(JSON.stringify({id: 2, error: {message: 'rate limit 429 token sk-secret'}}));
    throw new Error('expected rate-limit error');
} catch (error) {
    assert(error instanceof ProviderError, 'JSON-RPC error throws ProviderError');
    assertEqual(error.kind, REFRESH_STATES.RATE_LIMITED, 'rate limit classified');
    assert(!error.message.includes('sk-secret'), 'JSON-RPC errors are redacted');
}

const chatgptAuth = parseAuthStatusOutput('Logged in with ChatGPT', '', true);
assertEqual(chatgptAuth.kind, REFRESH_STATES.SUCCESSFUL, 'ChatGPT auth accepted');
const apiKeyAuth = parseAuthStatusOutput('Using API key authentication', '', true);
assertEqual(apiKeyAuth.kind, REFRESH_STATES.WRONG_AUTH_MODE, 'API key auth rejected');
assertEqual(apiKeyAuth.apiKeyUsed, true, 'API key flag preserved');
const missingAuth = parseAuthStatusOutput('Not logged in', '', false);
assertEqual(missingAuth.kind, REFRESH_STATES.NOT_AUTHENTICATED, 'missing auth rejected');

assertEqual(
    subprocessPathForCommand('/home/user/.nvm/versions/node/v24/bin/codex', '/usr/bin:/bin'),
    '/home/user/.nvm/versions/node/v24/bin:/usr/bin:/bin',
    'absolute Codex command directory is added to subprocess PATH');
assertEqual(
    subprocessPathForCommand('/home/user/.nvm/versions/node/v24/bin/codex', '/home/user/.nvm/versions/node/v24/bin:/usr/bin'),
    '/home/user/.nvm/versions/node/v24/bin:/usr/bin',
    'existing Codex command directory is not duplicated');
assertEqual(subprocessPathForCommand('codex', '/usr/bin:/bin'), '/usr/bin:/bin', 'PATH command keeps base PATH');

const failureCases = [
    [REFRESH_STATES.NOT_AUTHENTICATED, OVERALL_STATUSES.NOT_AUTHENTICATED],
    [REFRESH_STATES.WRONG_AUTH_MODE, OVERALL_STATUSES.NOT_AUTHENTICATED],
    [REFRESH_STATES.NOT_CONFIGURED, OVERALL_STATUSES.NOT_CONFIGURED],
    [REFRESH_STATES.RATE_LIMITED, OVERALL_STATUSES.ERROR],
    [REFRESH_STATES.TIMED_OUT, OVERALL_STATUSES.ERROR],
    [REFRESH_STATES.MALFORMED, OVERALL_STATUSES.ERROR],
];

for (const [kind, expectedStatus] of failureCases) {
    const failure = withDisplayFields(createFailureSnapshot(kind, 'Safe message', {sourceId: 'codex-app-server', nowUnix: 1770000000}), options);
    assertEqual(failure.overallStatus, expectedStatus, `${kind} failure mapping`);
    assertEqual(failure.errorMessage, 'Safe message', `${kind} safe message`);
}

const config = normalizeConfig({
    sourceKind: 'unexpected',
    codexCommand: '',
    refreshIntervalSeconds: 30,
    timeoutSeconds: 999999,
    warningThresholdPercent: 200,
    displayFormat: 'huge',
    bucketPriority: 'unknown',
});
assertEqual(config.sourceKind, 'codex-app-server', 'invalid source kind fallback');
assertEqual(config.codexCommand, 'codex', 'invalid command fallback');
assertEqual(config.refreshIntervalSeconds, 60, 'invalid refresh interval clamps to minimum');
assertEqual(config.timeoutSeconds, 15, 'invalid timeout fallback');
assertEqual(config.warningThresholdPercent, 25, 'invalid warning threshold fallback');
assertEqual(config.displayFormat, 'bucket-percent', 'invalid display format fallback');
assertEqual(config.bucketPriority, 'lowest', 'invalid bucket priority fallback');

assert(shouldMarkStale({...normalized, staleAfterUnix: 1770001000}, 1770001001), 'stale after timestamp');

const source = new MockBalanceSource({mockScenario: 'normal'});
const first = source.refresh(null, options);
const second = source.refresh(null, options);
assert(first === second, 'mock source does not start overlapping refreshes');
const snapshot = await first;
assertEqual(snapshot.overallStatus, OVERALL_STATUSES.NORMAL, 'mock source refresh result');

const failureSource = new MockBalanceSource({mockScenario: 'timeout'});
const failureSnapshot = await failureSource.refresh(null, options);
assertEqual(failureSnapshot.overallStatus, OVERALL_STATUSES.ERROR, 'mock failure snapshot maps to error');
assertEqual(failureSource.status, REFRESH_STATES.TIMED_OUT, 'mock source status tracks failure kind');

print('balance source tests passed');
