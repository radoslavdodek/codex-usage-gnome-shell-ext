# Research: Menu Refresh Settings

## Menu-Owned Refresh Controls

**Decision**: Add refresh configuration directly to the indicator menu as a persistent refresh section that is rebuilt with the rest of the menu. The section must be present for loading, successful, stale, authentication/configuration, unavailable, and error states. Use GNOME Shell `PopupMenu` primitives already used by the extension: a switch-style menu item for pause and a menu-owned whole-minute interval control that writes to GSettings.

**Rationale**: The feature is specifically about making refresh settings reachable from the panel menu. GNOME Shell's `PopupMenu` module is intended for panel-button menus and provides switch, submenu, and base menu item primitives suitable for this interaction. Keeping the controls in the existing menu avoids a separate manager workflow and keeps ownership under the extension's existing indicator lifecycle.

**Alternatives considered**:

- Preferences-only entry from the menu: rejected because the requested configuration should be directly accessible through the menu.
- A Shell Quick Settings tile: rejected because the existing UX is a top-bar indicator menu and the feature does not need a second Shell surface.
- A custom GTK widget inside the Shell menu: rejected because GTK preferences run in a separate process; Shell menu UI should stay with St/PopupMenu actors.

**Sources checked**:

- GNOME JavaScript Popup Menu guide: `https://gjs.guide/extensions/topics/popup-menu.html`

## Refresh Pause Semantics

**Decision**: Store refresh pause as a new boolean GSettings key named `refresh-paused`, defaulting to `false`. When pause is active, the top-bar caption is exactly `Paused`, automatic refresh timers are not armed, manual refresh actions are disabled or ignored, and any in-progress refresh is canceled or suppressed from rendering a visible refreshing state. Turning pause off reschedules automatic refresh with the selected interval and may trigger a normal refresh immediately.

**Rationale**: Pause is user intent to stop usage refresh attempts. Applying it at the scheduler and manual-action boundary guarantees no new work starts while paused. Canceling or rendering through a pause guard prevents an in-flight provider result from leaving the panel in a misleading loading/refreshing state.

**Alternatives considered**:

- Let an in-progress refresh complete while showing `Refreshing...`: rejected by FR-012 because the user should see the paused state after enabling pause.
- Suppress only automatic refreshes: rejected because FR-011 requires manual refresh attempts to be blocked too.
- Keep a timer armed and no-op on callback: rejected because removing the timer is clearer lifecycle ownership and avoids needless wakeups.

## Refresh Interval Range and Storage

**Decision**: Keep the existing GSettings key `refresh-interval-seconds` for compatibility, but narrow its valid range to 60 through 1800 seconds and expose it to users as 1 through 30 whole minutes. The default remains 300 seconds, and `DEFAULT_CONFIG.refreshIntervalSeconds` must align with the schema default. Invalid direct configuration should be rejected by the schema or normalized to the nearest valid minute where the code has to recover defensively.

**Rationale**: The existing runtime already reads `refresh-interval-seconds` and reschedules timers from settings changes, so keeping the key minimizes migration risk. Whole-minute presentation satisfies the user requirement while preserving GLib's seconds-based timeout API. Aligning code and schema defaults removes the current mismatch risk where fallback normalization can disagree with installed settings.

**Alternatives considered**:

- Add a new `refresh-interval-minutes` key and migrate from seconds: rejected as unnecessary schema churn for a single local setting.
- Keep the old 5-minute minimum: rejected because FR-003 explicitly requires 1-minute intervals.
- Allow second-level values in preferences while showing minutes in the menu: rejected because FR-004 limits user-facing choices to whole minutes.

## Settings Integration Pattern

**Decision**: Extend the existing settings module as the single normalization boundary for refresh interval and pause values. `configFromSettings()` should read `refresh-paused`, `connectSettings()` should watch it, and menu controls should write through `Gio.Settings` so persistence and external preference changes share one path. Preferences may continue to expose refresh interval, but should show the same 1-30 minute range and pause setting if updated.

**Rationale**: GNOME extension preferences and extension runtime can share GSettings values, and the current project already centralizes settings normalization. Keeping all refresh settings in that module reduces duplicate validation and makes non-Shell tests possible.

**Alternatives considered**:

- Keep pause only in memory: rejected because FR-007 and Story 3 require persistence across extension enable/disable and desktop restart.
- Let each menu control clamp values independently: rejected because external settings writes and preferences must follow the same validation contract.

**Sources checked**:

- GNOME JavaScript Preferences and GSettings guide: `https://gjs.guide/extensions/development/preferences.html`

## Menu Rebuild and State Reachability

**Decision**: Restructure menu rendering so refresh settings are appended independently of whether a usage snapshot exists. Loading or missing data should still show a loading row, then the refresh settings section. Snapshot-specific bucket, freshness, state, and sanitized error rows remain conditional.

**Rationale**: The current `_rebuildMenu()` returns early when `snapshot` is absent, which would hide configuration during first load. Moving settings rows outside snapshot-specific rendering directly satisfies FR-015 without changing source acquisition or normalized usage data.

**Alternatives considered**:

- Store menu controls once and update them in place: rejected for the first implementation because the extension already rebuilds the whole menu and `removeAll()` handles actor cleanup.
- Hide controls during loading to avoid partial state: rejected because loading is one of the required states where controls must remain reachable.

## Testing Strategy

**Decision**: Add focused non-Shell GJS tests for refresh settings normalization, pause defaults, range clamping/rejection, and any pure pause/interval helpers. Keep Shell-specific menu reachability, top-bar `Paused` caption, manual refresh suppression, timer cleanup, and repeated enable/disable verification in the manual checklist.

**Rationale**: Range and normalization logic can be verified quickly outside GNOME Shell. Menu actors, panel integration, timer ownership, and live source cancellation still need manual GNOME Shell verification because they depend on Shell APIs and lifecycle behavior.

**Alternatives considered**:

- Manual-only verification: rejected because settings range regressions are cheap and important to test automatically.
- Build full Shell automation in this feature: deferred because it is larger than the requested change and the project already uses manual Shell verification for lifecycle behavior.
