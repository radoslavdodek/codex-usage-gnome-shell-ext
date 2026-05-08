# Quickstart: Reset Time Countdown

## Automated Checks

Run the existing non-Shell test suite:

```sh
tests/run-tests.sh
```

Expected additions:

- `tests/formatter.test.js` covers `formatReset()` or the new reset countdown helper with injected `nowUnix`.
- Boundary cases include `Resets in less than 1 minute`, exactly `Resets in 1 minute`, combined hours/minutes, whole hours, multi-day durations such as `Resets in 2d 13h 15m`, `Reset due`, fallback reset text, and unavailable reset data.

## Local Mock Verification

1. Install or reload the extension with the existing project workflow.
2. Select the mock source or adjust mock fixture reset timestamps so the 5-hour and weekly buckets have known future reset values.
3. Open the indicator menu and confirm both bucket reset labels use relative text.
4. Confirm a weekly reset more than 24 hours away includes days, for example `Resets in 2d 13h 15m`.
5. Leave the menu open across a minute boundary and confirm countdown text remains understandable without pressing refresh.
6. Enable refresh pause and confirm the panel still reads `Paused` while reset rows, if shown, use relative text from the current snapshot.

## Live Provider Verification

1. Use the real `codex-app-server` source with ChatGPT authentication.
2. Open the indicator menu after a successful refresh.
3. Confirm available 5-hour and weekly reset values are displayed as relative countdowns rather than local date/time strings.
4. Confirm weekly reset values more than 24 hours away display with days instead of total hours.
5. Confirm the `Freshness` row still displays `Last refresh ...` as before.

## Failure And Lifecycle Verification

- Missing configuration or wrong auth mode still shows the existing actionable failure state.
- Malformed or missing reset data still shows fallback/unavailable reset text.
- Stale data keeps stale status labels and uses non-negative reset text.
- Manual refresh and automatic refresh behavior are unchanged.
- Repeated enable/disable cycles leave no countdown repaint timer or menu signal active.
- Closing the menu stops countdown repaint work.
