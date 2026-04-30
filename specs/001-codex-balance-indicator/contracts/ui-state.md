# Contract: UI State

The UI state contract defines how normalized Balance data appears in the GNOME top bar and dropdown.

## Panel Indicator

**Inputs**:

- `CodexBalanceSnapshot`
- `DisplayPreference`

**Output**:

- Exactly one panel item owned by the extension while enabled.
- One compact label and optional symbolic icon/state style.

**Rules**:

- Default bucket priority is `lowest`.
- Default display format is bucket label plus percent, for example `5h 87%` or `Week 12%`.
- Loading with no previous data displays a concise loading state.
- Failed refresh with previous data keeps the previous values visible and marks state stale/failed.
- Limit reached must be distinguishable from warning and normal.
- The panel must not use continuous animation.
- Panel text must never include raw errors, tokens, cookies, account IDs, or raw payload fragments.

## Dropdown Menu

**Required rows/actions**:

- 5-hour usage limit row: percent remaining, reset time/text, and bucket status.
- Weekly usage limit row: percent remaining, reset date/time/text, and bucket status.
- Last successful refresh time when available.
- Current overall data state.
- Manual refresh action.
- Sanitized error/authentication/configuration message when relevant.

**Rules**:

- If one bucket is unavailable, the other remains visible.
- Manual refresh must not start duplicate refresh work.
- Refresh-in-progress state must be visible or the action must be insensitive while active.
- Reset times must display in local timezone when parseable.
- API-key or unknown Codex auth mode must be shown as a sanitized ChatGPT-login-required state, not as successful usage data.
- Menu destruction during disable must remove all signal handlers and callbacks.

## State Mapping

| Normalized status | Panel treatment | Menu treatment |
| --- | --- | --- |
| `loading` | Loading label/icon | Show loading state and disabled/active refresh action |
| `normal` | Calm compact percent | Show both buckets and freshness |
| `warning` | Warning state | Highlight constrained bucket |
| `limit-reached` | Limit state | Show affected bucket at 0% |
| `stale` | Stale marker with previous values | Explain last success and failure/freshness issue |
| `not-authenticated` | Auth state | Show sanitized sign-in/auth message |
| `not-configured` | Config state | Show actionable missing configuration message |
| `error` | Error state | Show sanitized error message |
