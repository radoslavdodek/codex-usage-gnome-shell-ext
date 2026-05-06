import GLib from 'gi://GLib';

export function addPanelIndicator(Main, id, indicator, position = 0, box = 'right') {
    Main.panel.addToStatusArea(id, indicator, position, box);
}

export function destroyActor(actor) {
    if (!actor)
        return;
    if (typeof actor.destroy === 'function')
        actor.destroy();
}

export function removeSource(sourceId) {
    if (sourceId)
        GLib.Source.remove(sourceId);
}

export function disconnectSignals(target, signalIds) {
    if (!target || !signalIds)
        return;
    for (const id of signalIds) {
        if (id)
            target.disconnect(id);
    }
}

export function shellVersionMajor(Config) {
    const version = Config?.PACKAGE_VERSION ?? '';
    const major = Number(String(version).split('.')[0]);
    return Number.isFinite(major) ? major : null;
}
