# Research: Reset Time Countdown

## Decision: Keep Reset Timestamps As The Formatting Input

**Rationale**: The existing source and model flow already normalizes provider reset values into bucket `resetAtUnix` fields and preserves `resetText` only as a fallback. Reusing that shape keeps acquisition isolated from rendering and avoids storing derived display strings that would immediately become stale.

**Alternatives considered**: Parsing provider strings in the menu was rejected because it would duplicate source normalization. Storing countdown text in the snapshot was rejected because countdowns are time-sensitive presentation, not source data.

## Decision: Implement Relative Reset Formatting In `lib/formatter.js`

**Rationale**: `formatReset()` currently owns reset display and is already covered by `tests/formatter.test.js`. Keeping the change there makes the behavior reusable by all bucket row rendering and lets tests inject a fixed current time without running GNOME Shell.

**Alternatives considered**: Formatting directly in `extension.js` was rejected because it would make boundary behavior harder to test. Moving reset logic into `model.js` was rejected because the model should normalize data, not create time-dependent UI text.

## Decision: Use Whole-Minute Countdown Rules With Explicit Boundaries And Days

**Rationale**: The spec asks for `Resets in 1 minute`, compact hour/minute examples such as `Resets in 2h 15m`, multi-day weekly examples such as `Resets in 2d 13h 15m`, no zero-value clutter for whole hours or days, future reset text beginning with `Resets in`, and no negative countdowns. Flooring future durations to whole minutes gives stable, predictable text. Durations under one minute should use `Resets in less than 1 minute` rather than `0m` or an absolute timestamp. Due or elapsed values should use `Reset due`.

**Alternatives considered**: Rounding to the nearest minute was rejected because it can overstate remaining time and produce `1 minute` when less than 30 seconds remain. Showing total hours for long weekly durations was rejected because weekly limits can be more readable with full days shown explicitly.

## Decision: Preserve Existing Fallback Reset Text When No Timestamp Exists

**Rationale**: Some snapshots can contain unavailable, malformed, or fallback reset values. FR-009 requires existing unavailable/fallback behavior to remain intact. A valid `resetAtUnix` should produce relative text; otherwise existing `resetText` and `Reset unavailable` behavior should continue.

**Alternatives considered**: Converting fallback strings into countdowns was rejected because those strings may not be machine-parseable and may come from provider-specific states.

## Decision: Repaint Open Menu Countdown Text At Minute Granularity

**Rationale**: Refreshing provider data is unnecessary for a countdown derived from a known reset timestamp. A single GLib timeout while the dropdown is open can rebuild or refresh menu rows from the last snapshot so countdown text remains understandable as time passes, including suspend/resume and minute-boundary cases. The timer must be cleared when the menu closes and during `disable()`.

**Alternatives considered**: Updating only on data refresh was rejected because a menu left open can display stale relative wording. A per-second timer was rejected because the UI only displays minutes and the extension should avoid needless wakeups.

## Decision: Keep Absolute Date Formatting For Unrelated Metadata

**Rationale**: The feature targets reset labels for the 5-hour and weekly usage limits. `formatLastRefresh()` still benefits from the existing local date/time string because freshness is metadata about when data was obtained, not a countdown to future capacity.

**Alternatives considered**: Replacing all dates with relative strings was rejected as out of scope and could weaken troubleshooting for stale/failure states.
