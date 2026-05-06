# Data Model: Menu Refresh Settings

## RefreshSettings

Represents user-selected refresh behavior stored in GSettings.

**Fields**:

- `refreshIntervalSeconds`: integer, persisted in `refresh-interval-seconds`
- `refreshIntervalMinutes`: derived integer, user-facing value from 1 through 30
- `refreshPaused`: boolean, persisted in `refresh-paused`

**Validation rules**:

- `refreshIntervalSeconds` defaults to `300`.
- Valid interval values are whole-minute values from `60` through `1800` seconds.
- User-facing controls display and change values as whole minutes from `1` through `30`.
- Invalid direct values below 60 seconds or above 1800 seconds must be rejected by GSettings or corrected to the nearest valid value during defensive normalization.
- `refreshPaused` defaults to `false`.

## RefreshTimerState

Represents automatic refresh scheduling while the extension is enabled.

**Fields**:

- `timerId`: GLib source ID, or `0` when no automatic timer is armed
- `intervalSeconds`: current interval from `RefreshSettings`
- `isPaused`: boolean mirror of `RefreshSettings.refreshPaused`
- `refreshInProgress`: boolean derived from the active refresh promise/cancellable

**State transitions**:

- `disabled` -> `armed` when the extension is enabled and pause is off.
- `armed` -> `armed` when a valid interval changes; the old source is removed before a new one is added.
- `armed` -> `paused` when refresh pause is enabled; the GLib source is removed.
- `paused` -> `armed` when refresh pause is disabled; automatic refresh scheduling resumes using the selected interval.
- Any active state -> `disabled` during `disable()`; source IDs, cancellables, and settings signals are cleared.

**Validation rules**:

- At most one automatic refresh timer may be active.
- No automatic refresh may start while `isPaused` is true.
- Timer callbacks must not overlap provider refreshes.

## RefreshPauseState

Represents the visible paused mode that suppresses usage refresh attempts.

**Fields**:

- `isPaused`: boolean
- `panelText`: exactly `Paused` while active
- `manualRefreshAllowed`: boolean, false while active
- `automaticRefreshAllowed`: boolean, false while active
- `previousSnapshot`: latest retained usage snapshot, nullable

**State transitions**:

- `inactive` -> `active` when the user enables refresh pause from the menu or preferences.
- `active` -> `inactive` when the user disables refresh pause.
- `refreshing` -> `active` when pause is enabled during an in-progress refresh; the visible panel state becomes paused and no refreshing caption remains active.
- `active` persists across menu reopen, extension disable/enable, and desktop session restart.

**Validation rules**:

- While active, manual refresh activation must not start provider work.
- While active, automatic timer callbacks must not start provider work.
- The extension may retain the previous usage snapshot for menu detail context, but the panel caption must remain exactly `Paused`.

## UsageDisplayState

Extends the existing visible usage states with pause handling.

**States**:

- `loading`
- `normal`
- `warning`
- `limit-reached`
- `stale`
- `not-authenticated`
- `not-configured`
- `error`
- `paused`

**Validation rules**:

- `paused` takes precedence over all other panel captions.
- Existing loading, valid, stale, unavailable, rate-limited, malformed, unauthenticated, not-configured, and error menu details must remain reachable when pause is active.
- Existing usage display behavior remains unchanged when pause is inactive.
- Panel text and menu messages must not include raw provider payloads, credentials, tokens, account identifiers, or telemetry data.

## MenuConfigurationEntry

Represents the menu-visible controls for refresh behavior.

**Fields**:

- `currentIntervalMinutes`: integer from 1 through 30
- `pauseControlState`: boolean
- `visibleInUsageStates`: set of usage states where the controls are shown
- `settingWriteTarget`: GSettings key changed by the control

**Validation rules**:

- Controls must be visible for loading, valid, stale, unavailable, rate-limited, malformed, unauthenticated, not-configured, error, and paused states.
- Current interval and pause state must be visible without opening a separate extension manager.
- Menu control changes write to GSettings and then flow through the same settings-changed path as preferences changes.
- Repeated menu rebuilds must not retain stale signal handlers or duplicate controls.
