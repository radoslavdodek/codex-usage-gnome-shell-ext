import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {BalanceSource, ProviderError} from './balanceSource.js';
import {
    BUCKET_STATUSES,
    REFRESH_STATES,
    SOURCE_KINDS,
    createFailureSnapshot,
    createSnapshot,
    unixNow,
} from './model.js';
import {sanitizeError} from './redaction.js';
import {withDisplayFields} from './formatter.js';

const CLIENT_INFO = Object.freeze({
    name: 'codex-usage-gnome-shell-ext',
    title: 'Codex Usage Indicator',
    version: '0.1.0',
});

function classifyErrorMessage(message) {
    const lower = String(message ?? '').toLowerCase();
    if (lower.includes('rate limit') || lower.includes('429'))
        return REFRESH_STATES.RATE_LIMITED;
    if (lower.includes('timed out') || lower.includes('timeout'))
        return REFRESH_STATES.TIMED_OUT;
    if (lower.includes('auth') || lower.includes('login') || lower.includes('sign in'))
        return REFRESH_STATES.NOT_AUTHENTICATED;
    if (lower.includes('no such file') || lower.includes('not found') || lower.includes('spawn'))
        return REFRESH_STATES.NOT_CONFIGURED;
    return REFRESH_STATES.MALFORMED;
}

function missingCommandMessage(command) {
    return `Codex command "${command}" was not found. Set Codex Command to an absolute path, for example /home/user/.nvm/versions/node/v20/bin/codex.`;
}

function parseResetUnix(value) {
    if (value === null || value === undefined || value === '')
        return null;
    if (typeof value === 'number')
        return value > 100000000000 ? Math.floor(value / 1000) : Math.floor(value);
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (Number.isFinite(numeric))
            return numeric > 100000000000 ? Math.floor(numeric / 1000) : Math.floor(numeric);
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed))
            return Math.floor(parsed / 1000);
    }
    return null;
}

function windowToBucket(window, key, expectedDurationMins, label, options = {}) {
    if (!window)
        return {label, status: BUCKET_STATUSES.UNAVAILABLE, message: `${label} unavailable`};

    if (window.windowDurationMins !== undefined && Number(window.windowDurationMins) !== expectedDurationMins) {
        return {
            label,
            status: BUCKET_STATUSES.ERROR,
            message: `Unexpected ${label} window duration`,
        };
    }

    const usedPercent = Number(window.usedPercent);
    if (!Number.isFinite(usedPercent)) {
        return {
            label,
            status: BUCKET_STATUSES.ERROR,
            message: `Missing ${label} usage percentage`,
        };
    }

    const percentRemaining = Math.max(0, Math.min(100, Math.round(100 - usedPercent)));
    const resetAtUnix = parseResetUnix(window.resetsAt ?? window.resetAt ?? window.reset_at ?? window.resetTime);
    const resetText = resetAtUnix ? null : (typeof window.resetText === 'string' ? window.resetText : null);

    return {
        key,
        label,
        percentRemaining,
        resetAtUnix,
        resetText,
        status: options.status,
    };
}

export function parseAuthStatusOutput(stdout = '', stderr = '', exitSuccessful = true) {
    const output = `${stdout}\n${stderr}`;
    const lower = output.toLowerCase();

    if (lower.includes('api key') || lower.includes('api-key') || lower.includes('openai_api_key')) {
        return {
            mode: 'api-key',
            apiKeyUsed: true,
            kind: REFRESH_STATES.WRONG_AUTH_MODE,
            message: 'Codex is using API-key authentication. Sign in with ChatGPT for Codex Balance.',
        };
    }

    if (lower.includes('chatgpt') && !lower.includes('not logged in') && !lower.includes('not authenticated')) {
        return {
            mode: 'chatgpt',
            apiKeyUsed: false,
            kind: REFRESH_STATES.SUCCESSFUL,
            message: null,
        };
    }

    if (!exitSuccessful || lower.includes('not logged in') || lower.includes('not authenticated') || lower.includes('sign in')) {
        return {
            mode: 'missing',
            apiKeyUsed: false,
            kind: REFRESH_STATES.NOT_AUTHENTICATED,
            message: 'Sign in to Codex with ChatGPT before using the real source.',
        };
    }

    return {
        mode: 'unknown',
        apiKeyUsed: false,
        kind: REFRESH_STATES.NOT_AUTHENTICATED,
        message: 'Unable to verify ChatGPT authentication for Codex.',
    };
}

export function buildJsonRpcInput() {
    const initialize = {
        id: 1,
        method: 'initialize',
        params: {
            clientInfo: CLIENT_INFO,
            capabilities: {
                experimentalApi: true,
                optOutNotificationMethods: [],
            },
        },
    };
    const readLimits = {
        id: 2,
        method: 'account/rateLimits/read',
    };
    const initialized = {
        method: 'initialized',
    };
    return `${JSON.stringify(initialize)}\n${JSON.stringify(initialized)}\n${JSON.stringify(readLimits)}\n`;
}

export function parseJsonRpcOutput(stdout = '') {
    const lines = String(stdout).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const messages = [];

    for (const line of lines) {
        if (!line.startsWith('{'))
            continue;
        try {
            messages.push(JSON.parse(line));
        } catch (_error) {
            throw new ProviderError(REFRESH_STATES.MALFORMED, 'Codex app-server returned malformed JSON-RPC output.');
        }
    }

    const response = messages.find(message => message.id === 2) ?? messages.find(message => message.result?.rateLimits || message.result?.rateLimitsByLimitId);
    if (!response)
        throw new ProviderError(REFRESH_STATES.MALFORMED, 'Codex app-server did not return rate limit data.');

    if (response.error) {
        const message = sanitizeError(response.error.message ?? JSON.stringify(response.error));
        throw new ProviderError(classifyErrorMessage(message), message);
    }

    return response.result ?? response;
}

export function extractCodexRateLimit(result) {
    if (!result || typeof result !== 'object')
        throw new ProviderError(REFRESH_STATES.MALFORMED, 'Codex app-server returned an empty result.');

    const byId = result.rateLimitsByLimitId ?? result.GetAccountRateLimitsResponse?.rateLimitsByLimitId;
    if (byId?.codex)
        return byId.codex;

    const rateLimits = result.rateLimits ?? result.GetAccountRateLimitsResponse?.rateLimits;
    if (Array.isArray(rateLimits)) {
        const codex = rateLimits.find(item => item?.limitId === 'codex');
        if (codex)
            return codex;
    } else if (rateLimits?.limitId === 'codex') {
        return rateLimits;
    }

    if (result.limitId === 'codex')
        return result;

    throw new ProviderError(REFRESH_STATES.MALFORMED, 'Codex rate limit data was missing from app-server output.');
}

export function normalizeCodexRateLimitsPayload(result, options = {}) {
    const now = options.nowUnix ?? unixNow();
    const codex = extractCodexRateLimit(result);

    const fiveHour = windowToBucket(codex.primary, 'five-hour', 300, '5-hour usage limit');
    const weekly = windowToBucket(codex.secondary, 'weekly', 10080, 'Weekly usage limit');
    const hasBucketError = [fiveHour, weekly].some(bucket => bucket.status === BUCKET_STATUSES.ERROR);

    const snapshot = createSnapshot({
        sourceId: SOURCE_KINDS.CODEX_APP_SERVER,
        sourceAuth: {
            mode: 'chatgpt',
            apiKeyUsed: false,
            credentialLocation: 'helper-managed',
            workspaceSelection: 'default-context',
        },
        fiveHour,
        weekly,
        generatedAtUnix: now,
        lastSuccessfulUpdateUnix: hasBucketError ? null : now,
        errorMessage: hasBucketError ? 'Some Codex Balance data could not be parsed.' : null,
        rawErrorKind: hasBucketError ? REFRESH_STATES.MALFORMED : null,
    }, options);

    return withDisplayFields(snapshot, options);
}

function subprocessCommunicate(argv, input, timeoutSeconds, cancellable) {
    return new Promise((resolve, reject) => {
        let subprocess;
        try {
            subprocess = Gio.Subprocess.new(argv, Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
        } catch (error) {
            reject(new ProviderError(REFRESH_STATES.NOT_CONFIGURED, sanitizeError(error, 'Unable to start Codex command.'), {cause: error}));
            return;
        }

        let timeoutId = 0;
        let cancelSignalId = 0;
        let settled = false;
        const settleReject = error => {
            if (settled)
                return;
            settled = true;
            reject(error);
        };
        const settleResolve = value => {
            if (settled)
                return;
            settled = true;
            resolve(value);
        };

        if (cancellable) {
            cancelSignalId = cancellable.connect(() => {
                try {
                    subprocess.force_exit();
                } catch (_error) {
                }
            });
        }

        if (timeoutSeconds > 0) {
            timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, timeoutSeconds, () => {
                try {
                    subprocess.force_exit();
                } catch (_error) {
                }
                timeoutId = 0;
                settleReject(new ProviderError(REFRESH_STATES.TIMED_OUT, 'Codex app-server refresh timed out.'));
                return GLib.SOURCE_REMOVE;
            });
        }

        subprocess.communicate_utf8_async(input, cancellable, (_proc, result) => {
            if (settled)
                return;
            if (timeoutId) {
                GLib.Source.remove(timeoutId);
                timeoutId = 0;
            }
            if (cancelSignalId) {
                cancellable.disconnect(cancelSignalId);
                cancelSignalId = 0;
            }

            try {
                const [, stdout, stderr] = subprocess.communicate_utf8_finish(result);
                settleResolve({
                    stdout: stdout ?? '',
                    stderr: stderr ?? '',
                    successful: subprocess.get_successful(),
                });
            } catch (error) {
                const kind = cancellable?.is_cancelled?.() ? REFRESH_STATES.CANCELED : classifyErrorMessage(error.message);
                settleReject(new ProviderError(kind, sanitizeError(error, 'Codex provider failed.'), {cause: error}));
            }
        });
    });
}

function writeJsonLine(outputStream, message, cancellable) {
    const bytes = new TextEncoder().encode(`${JSON.stringify(message)}\n`);
    outputStream.write_all(bytes, cancellable);
}

function readJsonMessage(inputStream, cancellable, predicate) {
    return new Promise((resolve, reject) => {
        const readNext = () => {
            inputStream.read_line_async(GLib.PRIORITY_DEFAULT, cancellable, (stream, result) => {
                try {
                    const [line] = stream.read_line_finish_utf8(result);
                    if (line === null) {
                        reject(new ProviderError(REFRESH_STATES.MALFORMED, 'Codex app-server closed before returning rate limit data.'));
                        return;
                    }

                    const trimmed = line.trim();
                    if (!trimmed.startsWith('{')) {
                        readNext();
                        return;
                    }

                    let message;
                    try {
                        message = JSON.parse(trimmed);
                    } catch (_error) {
                        reject(new ProviderError(REFRESH_STATES.MALFORMED, 'Codex app-server returned malformed JSON-RPC output.'));
                        return;
                    }

                    if (message.error || predicate(message))
                        resolve(message);
                    else
                        readNext();
                } catch (error) {
                    const kind = cancellable?.is_cancelled?.() ? REFRESH_STATES.CANCELED : classifyErrorMessage(error.message);
                    reject(new ProviderError(kind, sanitizeError(error, 'Codex provider failed.'), {cause: error}));
                }
            });
        };

        readNext();
    });
}

function appServerReadRateLimits(command, timeoutSeconds, cancellable) {
    return new Promise((resolve, reject) => {
        let subprocess;
        try {
            subprocess = Gio.Subprocess.new([command, 'app-server', '--listen', 'stdio://'], Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
        } catch (error) {
            reject(new ProviderError(REFRESH_STATES.NOT_CONFIGURED, sanitizeError(error, 'Unable to start Codex command.'), {cause: error}));
            return;
        }

        const stdin = subprocess.get_stdin_pipe();
        const stdout = new Gio.DataInputStream({base_stream: subprocess.get_stdout_pipe()});
        let timeoutId = 0;
        let cancelSignalId = 0;
        let settled = false;

        const cleanup = () => {
            if (timeoutId) {
                GLib.Source.remove(timeoutId);
                timeoutId = 0;
            }
            if (cancelSignalId) {
                cancellable.disconnect(cancelSignalId);
                cancelSignalId = 0;
            }
        };

        const settleReject = error => {
            if (settled)
                return;
            settled = true;
            cleanup();
            try {
                subprocess.force_exit();
            } catch (_error) {
            }
            reject(error);
        };

        const settleResolve = value => {
            if (settled)
                return;
            settled = true;
            cleanup();
            try {
                stdin.close(cancellable);
            } catch (_error) {
            }
            try {
                subprocess.force_exit();
            } catch (_error) {
            }
            resolve(value);
        };

        if (cancellable) {
            cancelSignalId = cancellable.connect(() => {
                settleReject(new ProviderError(REFRESH_STATES.CANCELED, 'Codex app-server refresh was canceled.'));
            });
        }

        if (timeoutSeconds > 0) {
            timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, timeoutSeconds, () => {
                timeoutId = 0;
                settleReject(new ProviderError(REFRESH_STATES.TIMED_OUT, 'Codex app-server refresh timed out.'));
                return GLib.SOURCE_REMOVE;
            });
        }

        try {
            writeJsonLine(stdin, {
                id: 1,
                method: 'initialize',
                params: {
                    clientInfo: CLIENT_INFO,
                    capabilities: {
                        experimentalApi: true,
                        optOutNotificationMethods: [],
                    },
                },
            }, cancellable);
        } catch (error) {
            settleReject(new ProviderError(classifyErrorMessage(error.message), sanitizeError(error, 'Unable to initialize Codex app-server.'), {cause: error}));
            return;
        }

        readJsonMessage(stdout, cancellable, message => message.id === 1)
            .then(message => {
                if (message.error)
                    throw new ProviderError(classifyErrorMessage(message.error.message), sanitizeError(message.error.message ?? JSON.stringify(message.error)));

                writeJsonLine(stdin, {method: 'initialized'}, cancellable);
                writeJsonLine(stdin, {id: 2, method: 'account/rateLimits/read'}, cancellable);
                return readJsonMessage(stdout, cancellable, nextMessage => nextMessage.id === 2);
            })
            .then(message => {
                settleResolve(`${JSON.stringify(message)}\n`);
            })
            .catch(error => {
                const providerError = error instanceof ProviderError ? error :
                    new ProviderError(classifyErrorMessage(error.message), sanitizeError(error, 'Codex provider failed.'), {cause: error});
                settleReject(providerError);
            });
    });
}

export class CodexAppServerSource extends BalanceSource {
    constructor(config = {}) {
        super(config);
        this._subprocessCancellable = null;
    }

    get id() {
        return SOURCE_KINDS.CODEX_APP_SERVER;
    }

    async _checkAuth(options) {
        const command = options.codexCommand ?? this._config.codexCommand ?? 'codex';
        let result;
        try {
            result = await subprocessCommunicate([command, 'login', 'status'], null, options.timeoutSeconds ?? 15, this._subprocessCancellable);
        } catch (error) {
            if (error instanceof ProviderError && error.kind === REFRESH_STATES.NOT_CONFIGURED)
                throw new ProviderError(REFRESH_STATES.NOT_CONFIGURED, missingCommandMessage(command), {cause: error});
            throw error;
        }
        const auth = parseAuthStatusOutput(result.stdout, result.stderr, result.successful);

        if (auth.kind !== REFRESH_STATES.SUCCESSFUL)
            throw new ProviderError(auth.kind, sanitizeError(auth.message), {cause: auth});

        return auth;
    }

    async _readRateLimits(options) {
        const command = options.codexCommand ?? this._config.codexCommand ?? 'codex';
        let stdout;
        try {
            stdout = await appServerReadRateLimits(command, options.timeoutSeconds ?? 15, this._subprocessCancellable);
        } catch (error) {
            if (error instanceof ProviderError && error.kind === REFRESH_STATES.NOT_CONFIGURED)
                throw new ProviderError(REFRESH_STATES.NOT_CONFIGURED, missingCommandMessage(command), {cause: error});
            throw error;
        }

        const payload = parseJsonRpcOutput(stdout);
        return normalizeCodexRateLimitsPayload(payload, options);
    }

    refresh(cancellable, options = {}) {
        if (this._activeRefresh)
            return this._activeRefresh;

        const merged = {...this._config, ...options};
        this._status = this._lastSnapshot ? REFRESH_STATES.REFRESHING : REFRESH_STATES.LOADING;
        this._subprocessCancellable = cancellable ?? new Gio.Cancellable();

        this._activeRefresh = (async () => {
            try {
                await this._checkAuth(merged);
                const snapshot = await this._readRateLimits(merged);
                this._lastSnapshot = snapshot;
                this._status = REFRESH_STATES.SUCCESSFUL;
                return snapshot;
            } catch (error) {
                const kind = error instanceof ProviderError ? error.kind : classifyErrorMessage(error.message);
                const message = sanitizeError(error);
                this._status = kind;
                return withDisplayFields(createFailureSnapshot(kind, message, {
                    ...merged,
                    sourceId: SOURCE_KINDS.CODEX_APP_SERVER,
                    sourceAuth: {
                        mode: kind === REFRESH_STATES.WRONG_AUTH_MODE ? 'api-key' : 'unknown',
                        apiKeyUsed: kind === REFRESH_STATES.WRONG_AUTH_MODE,
                    },
                }), merged);
            } finally {
                this._subprocessCancellable = null;
                this._activeRefresh = null;
            }
        })();

        return this._activeRefresh;
    }

    cancel() {
        if (this._subprocessCancellable && !this._subprocessCancellable.is_cancelled())
            this._subprocessCancellable.cancel();
        this._status = REFRESH_STATES.CANCELED;
    }
}
