import GLib from 'gi://GLib';

import {CodexAppServerSource} from '../lib/codexAppServerSource.js';

const command = GLib.getenv('CODEX_COMMAND') ?? 'codex';
const source = new CodexAppServerSource({
    codexCommand: command,
    timeoutSeconds: 15,
    refreshIntervalSeconds: 1800,
    warningThresholdPercent: 25,
    bucketPriority: 'lowest',
    displayFormat: 'bucket-percent',
});

const snapshot = await source.refresh(null, {
    codexCommand: command,
    timeoutSeconds: 15,
    refreshIntervalSeconds: 1800,
    warningThresholdPercent: 25,
    bucketPriority: 'lowest',
    displayFormat: 'bucket-percent',
});

source.destroy();

print(JSON.stringify({
    overallStatus: snapshot.overallStatus,
    displayText: snapshot.displayText,
    fiveHourPercentRemaining: snapshot.fiveHour.percentRemaining,
    weeklyPercentRemaining: snapshot.weekly.percentRemaining,
    errorMessage: snapshot.errorMessage,
}, null, 2));
