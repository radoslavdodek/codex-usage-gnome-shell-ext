# Data Model: Reset Time Countdown

## UsageLimitReset

Represents the reset moment for one tracked usage limit.

**Fields**

- `bucketKey`: `five-hour` or `weekly`
- `resetAtUnix`: normalized Unix timestamp in seconds, or `null`
- `resetText`: provider fallback text, or `null`
- `status`: existing bucket status (`normal`, `warning`, `limit-reached`, `stale`, `unavailable`, `error`)

**Validation Rules**

- A finite future `resetAtUnix` is formatted as a relative countdown.
- A finite `resetAtUnix` at or before current time must not produce a negative countdown.
- `resetText` is used only when `resetAtUnix` is unavailable.
- Unavailable/error buckets continue to display the existing unavailable/failure state.

## RelativeResetText

User-facing reset phrase derived from `UsageLimitReset` and current time.

**Fields**

- `prefix`: `Resets in` for future reset times
- `durationText`: human-readable relative duration
- `fallbackText`: existing fallback phrase when no timestamp exists

**Validation Rules**

- Exactly 1 minute displays as `Resets in 1 minute`.
- Future durations under 1 minute display as `Resets in less than 1 minute`.
- Future durations of at least 1 hour display compact hours/minutes, for example `Resets in 2h 15m`.
- Whole-hour future durations omit the minute portion, for example `Resets in 2h`.
- Elapsed or due timestamps display `Reset due` and never include negative numbers.
- More-than-24-hour durations remain comparable by using total hours, for example `Resets in 49h 30m`.

## UsageDetailDisplay

Existing menu-visible bucket row composed from a usage limit bucket.

**Fields**

- `label`: existing bucket label such as `5-hour usage limit` or `Weekly usage limit`
- `value`: existing remaining percentage display
- `status`: existing bucket status label
- `reset`: `RelativeResetText` result for timestamped resets, or existing fallback/unavailable text

**Relationships**

- One `UsageDetailDisplay` row corresponds to one `UsageLimitReset`.
- The row is rebuilt from the current snapshot and config; no derived countdown text is stored.

## MenuCountdownRefresh

Optional lifecycle-owned menu repaint timer for open dropdown countdowns.

**Fields**

- `menuOpen`: whether the indicator menu is currently open
- `timeoutId`: GLib source id for minute-level repaint, or `0`
- `snapshot`: existing in-memory effective snapshot

**State Transitions**

- `closed -> open`: render current rows and schedule one minute-level repaint timer if any visible bucket has a timestamp.
- `open -> open`: repaint from the existing snapshot when the timer fires, then continue while the menu remains open.
- `open -> closed`: remove the timeout and clear `timeoutId`.
- `enabled -> disabled`: remove the timeout, disconnect any menu signal, and clear state.
