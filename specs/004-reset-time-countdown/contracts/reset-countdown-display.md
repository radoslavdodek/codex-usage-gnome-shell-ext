# Contract: Reset Countdown Display

## Scope

This contract defines the user-visible dropdown behavior for 5-hour and weekly reset timing. It does not change top-bar text, usage acquisition, settings, preferences, source selection, authentication, or storage.

## Bucket Row Display

- For each visible 5-hour or weekly bucket with a valid `resetAtUnix`, the reset part of the row MUST be relative to current local time.
- Future reset text MUST start with `Resets in`.
- Exactly one remaining minute MUST display `Resets in 1 minute`.
- Durations with hours and minutes MUST use compact notation such as `Resets in 2h 15m`.
- Whole-hour durations MUST omit a zero-minute suffix.
- Future durations under one minute MUST display `Resets in less than 1 minute`.
- Due or elapsed reset timestamps MUST display `Reset due` and MUST NOT display a future countdown, negative number, or absolute date/time string.
- Buckets without valid reset timestamps MUST keep the existing fallback behavior: provider `resetText` if present, otherwise `Reset unavailable`.

## Menu Repaint Behavior

- Opening the menu SHOULD render countdown text using the current time, not the time when the snapshot was fetched.
- If the menu remains open, countdown text SHOULD refresh at minute granularity using the existing snapshot.
- Repainting countdown text MUST NOT start a provider refresh, subprocess, file read, network request, settings write, or credential lookup.
- The repaint timer MUST run only while the menu is open and only while the extension is enabled.
- Closing the menu or disabling the extension MUST remove the repaint timer.

## Existing State Preservation

- Loading, unavailable, malformed, auth/config failure, stale data, refresh pause, and manual refresh states MUST remain distinguishable.
- `Last refresh` text MAY continue to use an absolute local date/time string.
- Existing percentage values, status labels, warning/limit logic, panel caption behavior, and refresh interval/pause controls MUST remain unchanged.

## Manual Acceptance

- With a 5-hour reset one minute away, the menu row reads `Resets in 1 minute`.
- With a weekly reset two hours and fifteen minutes away, the menu row reads `Resets in 2h 15m`.
- With both limits visible, both rows use relative reset text.
- With a reset less than one minute away, the row reads `Resets in less than 1 minute`.
- With a reset in the past, the row reads `Reset due`.
- With reset data unavailable, the row preserves the existing unavailable or fallback state.
