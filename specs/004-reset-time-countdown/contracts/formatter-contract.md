# Contract: Formatter Reset Countdown

## Public Formatting Behavior

`formatReset(bucket, options)` and `formatBucketRow(bucket, options)` are expected to support deterministic reset countdown formatting.

## Inputs

- `bucket.resetAtUnix`: Unix timestamp in seconds, milliseconds normalized by the model before formatting, ISO string-derived timestamp normalized by the model before formatting, or `null`.
- `bucket.resetText`: fallback string used only when `resetAtUnix` is unavailable.
- `options.nowUnix`: optional Unix timestamp in seconds for deterministic tests. When omitted, the formatter may use the current time.

## Outputs

The reset output is a string suitable for direct menu display.

| Condition | Expected output shape |
|-----------|-----------------------|
| `bucket` is missing | `Reset unavailable` |
| `resetAtUnix` is missing and `resetText` is present | `Resets {resetText}` |
| `resetAtUnix` is missing and `resetText` is missing | `Reset unavailable` |
| future delta is less than 60 seconds | `Resets in less than 1 minute` |
| future delta is exactly 60 seconds | `Resets in 1 minute` |
| future delta is 2 hours 15 minutes | `Resets in 2h 15m` |
| future delta is whole hours | `Resets in {hours}h` |
| future delta is 2 days 13 hours 15 minutes | `Resets in 2d 13h 15m` |
| future delta is whole days | `Resets in {days}d` |
| future delta is days and hours with zero minutes | `Resets in {days}d {hours}h` |
| delta is zero or negative | `Reset due` |

## Non-Goals

- Do not change `formatLastRefresh()` absolute local date/time behavior.
- Do not parse arbitrary fallback `resetText` values.
- Do not mutate buckets or snapshots while formatting.
- Do not add dependencies outside GJS/GLib and standard JavaScript APIs.

## Test Requirements

- Formatter tests MUST inject `nowUnix` and assert exact strings for one minute, combined hours/minutes, whole hours, multi-day durations, less than one minute, elapsed values, unavailable values, and fallback `resetText`.
- Existing panel display and bucket status tests MUST continue to pass.
