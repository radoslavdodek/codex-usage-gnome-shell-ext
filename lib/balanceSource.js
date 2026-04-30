import {REFRESH_STATES} from './model.js';

export class ProviderError extends Error {
    constructor(kind, message, options = {}) {
        super(message);
        this.name = 'ProviderError';
        this.kind = kind;
        this.cause = options.cause ?? null;
    }
}

export class BalanceSource {
    constructor(config = {}) {
        this._config = config;
        this._status = REFRESH_STATES.IDLE;
        this._lastSnapshot = null;
        this._activeRefresh = null;
    }

    get id() {
        return 'base';
    }

    get status() {
        return this._status;
    }

    getLastSnapshot() {
        return this._lastSnapshot;
    }

    refresh(_cancellable, _options = {}) {
        throw new ProviderError(REFRESH_STATES.NOT_CONFIGURED, 'Balance source is not implemented.');
    }

    cancel() {
    }

    destroy() {
        this.cancel();
        this._lastSnapshot = null;
        this._activeRefresh = null;
        this._status = REFRESH_STATES.IDLE;
    }
}

export function providerErrorKind(error) {
    return error instanceof ProviderError ? error.kind : REFRESH_STATES.MALFORMED;
}
