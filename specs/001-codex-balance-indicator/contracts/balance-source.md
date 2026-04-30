# Contract: Balance Source

The Balance Source contract isolates all Codex usage acquisition from panel and menu rendering.

## Interface

```js
class BalanceSource {
    get id() {}
    get status() {}
    getLastSnapshot() {}
    refresh(cancellable, options) {}
    cancel() {}
    destroy() {}
}
```

## `refresh(cancellable, options)`

Starts one provider refresh and resolves to a normalized `CodexBalanceSnapshot`.

**Options**:

- `timeoutSeconds`: provider timeout, default 15
- `warningThresholdPercent`: status threshold, default 25
- `nowUnix`: optional test clock

**Rules**:

- Must not start overlapping provider work. If called while active, return the active promise or report an in-progress state without spawning duplicate work.
- Must use asynchronous GLib/Gio APIs or subprocess APIs.
- Must support cancellation during `disable()`.
- Must never return raw provider payloads.
- Must sanitize errors before returning a snapshot or throwing a provider error.
- Must not use `OPENAI_API_KEY` for real Codex Balance retrieval.
- Must map authentication failures to `not-authenticated`.
- Must map API-key authentication to a rejected wrong-auth-mode state rather than treating it as valid Codex Balance data.
- Must map missing provider configuration to `not-configured`.
- Must map invalid or incomplete provider output to `malformed` or bucket-level `error`.
- Must preserve the previous successful snapshot outside the provider or expose enough status for the controller to preserve it.

## Successful Provider Output

A successful provider must produce both bucket keys:

```json
{
  "schemaVersion": 1,
  "sourceId": "codex-app-server",
  "sourceAuth": {
    "mode": "chatgpt",
    "apiKeyUsed": false,
    "credentialLocation": "helper-managed",
    "workspaceSelection": "default-context",
    "message": null
  },
  "overallStatus": "normal",
  "fiveHour": {
    "key": "five-hour",
    "label": "5-hour usage limit",
    "percentRemaining": 87,
    "resetAtUnix": 1770000000,
    "resetText": null,
    "status": "normal"
  },
  "weekly": {
    "key": "weekly",
    "label": "Weekly usage limit",
    "percentRemaining": 95,
    "resetAtUnix": 1770300000,
    "resetText": null,
    "status": "normal"
  },
  "lastSuccessfulUpdateUnix": 1769712000,
  "generatedAtUnix": 1769712000,
  "staleAfterUnix": 1769715600,
  "displayText": "5h 87%",
  "detailText": "Codex Balance normal",
  "errorMessage": null
}
```

## Codex App-Server Provider Contract

The real first-release provider is `codex-app-server`. The provider must obtain current Codex usage and limits by spawning the installed Codex CLI app server:

```text
codex app-server --listen stdio://
```

The provider sends newline-delimited JSON-RPC requests:

```json
{"id":1,"method":"initialize","params":{"clientInfo":{"name":"codex-usage-gnome-shell-ext","title":"Codex Usage Indicator","version":"0.1.0"},"capabilities":{"experimentalApi":true,"optOutNotificationMethods":[]}}}
```

```json
{"id":2,"method":"account/rateLimits/read"}
```

It must parse `GetAccountRateLimitsResponse.rateLimitsByLimitId.codex` when present and may fall back to `rateLimits` only when that snapshot has `limitId: "codex"`.

**Normalization rules**:

- `primary.windowDurationMins: 300` maps to the 5-hour usage limit.
- `secondary.windowDurationMins: 10080` maps to the weekly usage limit.
- `percentRemaining` is `100 - usedPercent`, clamped or rejected according to validation rules.
- `resetsAt` maps to `resetAtUnix` when present.
- Missing, renamed, or unexpected windows map to malformed output or bucket-level unavailable/error states.

**Authentication rules**:

- Required auth mode is ChatGPT login.
- API-key auth is invalid for this feature, even when `OPENAI_API_KEY` is present.
- The provider may run `codex login status` and inspect only non-secret auth metadata to verify ChatGPT login before starting the app-server request.
- The provider must not print, persist, or return access tokens, refresh tokens, ID tokens, cookies, authorization headers, account identifiers, or raw authenticated payloads.
- If ChatGPT auth is missing, expired, or unavailable, return or exit with a state that maps to `not-authenticated`.
- If API-key auth is detected, return or exit with a state that maps to wrong-auth-mode and a sanitized message instructing the user to sign in with ChatGPT.

**Verified feasibility**:

- On 2026-04-30, Codex CLI `0.125.0` returned `rateLimitsByLimitId.codex` from `account/rateLimits/read`.
- The response contained both `primary` and `secondary` windows.
- The primary duration was 300 minutes; the secondary duration was 10080 minutes.
- Both windows had numeric `usedPercent` and reset timestamps.

**Exit behavior**:

- Successful JSON-RPC response: parse result as usage data.
- JSON-RPC error or app-server non-zero exit: treat stderr/stdout as sensitive, redact, and map to an auth, configuration, timeout, rate-limit, malformed, or error state.
- Timeout: terminate the app-server process and map to `timed-out`.

## Privacy Requirements

- Providers must not persist credentials, cookies, authorization headers, account identifiers, or raw page/API payloads.
- Providers must not log raw stdout/stderr before redaction.
- Providers must not transmit data to third-party services.
- Providers that depend on existing authentication must use the selected source's default authenticated context without implementing workspace/account selection for first release.
- Providers must not silently downgrade from ChatGPT auth to API-key auth.
