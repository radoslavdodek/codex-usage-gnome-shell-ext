# Contract: Menu Refresh Settings

This contract defines the user-facing menu behavior for refresh interval and pause settings.

## Required Menu Section

The indicator menu MUST include a refresh configuration section whenever the extension is enabled.

**Required controls**:

- Current refresh interval, displayed in whole minutes.
- A way to change the interval to any whole-minute value from 1 through 30.
- Refresh pause switch/control showing the current pause state.
- Manual refresh action that is disabled or ignored while paused.

**State reachability**:

The refresh controls MUST remain reachable while usage data is:

- loading
- normal
- stale
- unavailable
- rate-limited
- malformed
- unauthenticated
- not configured
- in a generic error state
- paused

## Refresh Interval Behavior

**Inputs**:

- User activation of the menu interval control.
- External changes to `refresh-interval-seconds`.

**Outputs**:

- GSettings key `refresh-interval-seconds` stores the selected interval in seconds.
- The visible menu state displays the selected value in minutes.
- The automatic refresh timer uses the selected interval without requiring Shell reload or extension disable/enable.

**Rules**:

- Valid menu values are `1` through `30` minutes, inclusive.
- Values are whole minutes only.
- Default visible interval is `5 minutes`.
- Changing the interval removes any previous timer before scheduling a new one.
- Changing the interval while paused updates the stored value but does not arm an automatic timer until pause is disabled.
- Out-of-range direct settings values must be rejected or normalized to the nearest valid value without crashing or hiding the menu controls.

## Refresh Pause Behavior

**Inputs**:

- User toggles refresh pause in the menu.
- External changes to `refresh-paused`.

**Outputs**:

- GSettings key `refresh-paused` stores the selected pause state.
- Top-bar caption is exactly `Paused` while active.
- The menu shows pause as active.

**Rules**:

- No automatic usage refresh may start while paused.
- No manual usage refresh may start while paused.
- Enabling pause during an in-progress refresh must remove the visible refreshing state and settle the panel on `Paused`.
- Disabling pause resumes normal refresh behavior using the selected interval.
- Existing sanitized usage details may remain visible in the menu while paused.
- Pause does not modify source kind, Codex command, authentication handling, warning threshold, display format, bucket priority, or privacy behavior.

## Lifecycle Rules

- No menu controls, settings signals, timers, source work, or external access are created before `enable()`.
- All timer sources, cancellables, menu actors, signal handlers, and source state are cleaned up in `disable()`.
- Repeated enable/disable cycles must not duplicate indicators, timers, menu controls, settings signals, or provider work.
