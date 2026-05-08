import GLib from 'gi://GLib';

import {
    BUCKET_KEYS,
    BUCKET_STATUSES,
    OVERALL_STATUSES,
    createSnapshot,
    selectPriorityBucket,
} from './model.js';

const STATUS_LABELS = Object.freeze({
    [OVERALL_STATUSES.LOADING]: 'Loading',
    [OVERALL_STATUSES.NORMAL]: 'Normal',
    [OVERALL_STATUSES.WARNING]: 'Low',
    [OVERALL_STATUSES.LIMIT_REACHED]: 'Limit',
    [OVERALL_STATUSES.STALE]: 'Stale',
    [OVERALL_STATUSES.NOT_AUTHENTICATED]: 'Sign in',
    [OVERALL_STATUSES.NOT_CONFIGURED]: 'Setup',
    [OVERALL_STATUSES.ERROR]: 'Error',
});

const BUCKET_SHORT_LABELS = Object.freeze({
    [BUCKET_KEYS.FIVE_HOUR]: '5h',
    [BUCKET_KEYS.WEEKLY]: 'Week',
});

const BUCKET_STATUS_LABELS = Object.freeze({
    [BUCKET_STATUSES.NORMAL]: 'Normal',
    [BUCKET_STATUSES.WARNING]: 'Low',
    [BUCKET_STATUSES.LIMIT_REACHED]: 'Limit reached',
    [BUCKET_STATUSES.STALE]: 'Stale',
    [BUCKET_STATUSES.UNAVAILABLE]: 'Unavailable',
    [BUCKET_STATUSES.ERROR]: 'Error',
});

export function statusLabel(status) {
    return STATUS_LABELS[status] ?? 'Error';
}

export function bucketStatusLabel(status) {
    return BUCKET_STATUS_LABELS[status] ?? 'Error';
}

export function formatPercent(percentRemaining) {
    return percentRemaining === null || percentRemaining === undefined ? 'Unavailable' : `${percentRemaining}%`;
}

export function formatUnixLocal(unixSeconds) {
    if (!unixSeconds)
        return null;

    try {
        const date = GLib.DateTime.new_from_unix_local(unixSeconds);
        return date ? date.format('%Y-%m-%d %H:%M') : null;
    } catch (_error) {
        return null;
    }
}

function currentUnix() {
    return Math.floor(Date.now() / 1000);
}

function optionNowUnix(options) {
    return Number.isFinite(options?.nowUnix) ? Math.floor(options.nowUnix) : currentUnix();
}

export function formatReset(bucket, options = {}) {
    if (!bucket)
        return 'Reset unavailable';
    if (Number.isFinite(bucket.resetAtUnix)) {
        const deltaSeconds = Math.floor(bucket.resetAtUnix) - optionNowUnix(options);
        if (deltaSeconds <= 0)
            return 'Reset due';
        if (deltaSeconds < 60)
            return 'Resets in less than 1 minute';

        const minutes = Math.floor(deltaSeconds / 60);
        if (minutes < 60)
            return minutes === 1 ? 'Resets in 1 minute' : `Resets in ${minutes} minutes`;

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes === 0 ? `Resets in ${hours}h` : `Resets in ${hours}h ${remainingMinutes}m`;
    }
    if (bucket.resetText)
        return `Resets ${bucket.resetText}`;
    return 'Reset unavailable';
}

export function formatLastRefresh(unixSeconds) {
    const formatted = formatUnixLocal(unixSeconds);
    return formatted ? `Last refresh ${formatted}` : 'No successful refresh yet';
}

export function formatBucketRow(bucket, options = {}) {
    return {
        label: bucket?.label ?? 'Usage limit',
        value: formatPercent(bucket?.percentRemaining),
        reset: formatReset(bucket, options),
        status: bucketStatusLabel(bucket?.status),
        message: bucket?.message ?? null,
    };
}

export function derivePanelDisplayText(snapshot, preferences = {}) {
    if (!snapshot)
        return 'Codex';

    const format = preferences.displayFormat ?? 'bucket-percent';
    const bucket = selectPriorityBucket(snapshot, preferences.bucketPriority ?? 'lowest');
    const state = statusLabel(snapshot.overallStatus);

    if ([OVERALL_STATUSES.LOADING, OVERALL_STATUSES.NOT_AUTHENTICATED, OVERALL_STATUSES.NOT_CONFIGURED, OVERALL_STATUSES.ERROR].includes(snapshot.overallStatus))
        return `Codex ${state}`;

    if (format === 'state-label')
        return `Codex ${state}`;

    if (!bucket || bucket.percentRemaining === null)
        return `Codex ${state}`;

    if (format === 'percent-only')
        return formatPercent(bucket.percentRemaining);

    return `${BUCKET_SHORT_LABELS[bucket.key] ?? 'Codex'} ${formatPercent(bucket.percentRemaining)}`;
}

export function deriveDetailText(snapshot) {
    if (!snapshot)
        return 'Codex Balance unavailable';

    if (snapshot.errorMessage)
        return snapshot.errorMessage;

    switch (snapshot.overallStatus) {
    case OVERALL_STATUSES.LOADING:
        return 'Refreshing Codex Balance';
    case OVERALL_STATUSES.NORMAL:
        return 'Codex Balance normal';
    case OVERALL_STATUSES.WARNING:
        return 'Codex Balance is low';
    case OVERALL_STATUSES.LIMIT_REACHED:
        return 'Codex Balance limit reached';
    case OVERALL_STATUSES.STALE:
        return 'Codex Balance data is stale';
    case OVERALL_STATUSES.NOT_AUTHENTICATED:
        return 'Sign in to Codex with ChatGPT';
    case OVERALL_STATUSES.NOT_CONFIGURED:
        return 'Configure the Codex usage source';
    default:
        return 'Unable to refresh Codex Balance';
    }
}

export function withDisplayFields(snapshot, preferences = {}) {
    const normalized = createSnapshot(snapshot, preferences);
    return {
        ...normalized,
        displayText: derivePanelDisplayText(normalized, preferences),
        detailText: deriveDetailText(normalized),
    };
}
