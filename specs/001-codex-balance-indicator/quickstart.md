# Quickstart: Top-bar Codex Balance Usage Indicator

## Development Setup

1. Install or use a GNOME Shell environment for one of the supported versions: 46, 47, 48, or 49.
2. Keep the extension source at repository root with `metadata.json` and `extension.js`.
3. The default provider is the real Codex app-server source. Use the mock provider only to verify UI, lifecycle, normalization, stale handling, and redaction without needing a real Codex source.
4. The real source uses the installed Codex CLI app server: `codex app-server --listen stdio://`.
5. If Codex is installed in a user-local toolchain such as nvm, set the `codex-command` preference to the absolute path from `command -v codex`; GNOME Shell may not inherit the terminal `PATH`.
6. Before release completion, verify `account/rateLimits/read` exposes the 300-minute and 10080-minute Codex windows and rejects API-key authentication.

## Local Install Flow

1. Ensure `metadata.json` lists GNOME Shell versions `46`, `47`, `48`, and `49`.
2. Prefer installing a packaged archive:
   `gnome-extensions pack -f -o /tmp/codex-usage-pack --extra-source=lib --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml .`
   followed by
   `gnome-extensions install --force /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`.
3. If copying files manually into `~/.local/share/gnome-shell/extensions/codex-usage@rado`, compile schemas in the copied `schemas/` directory.
4. After package install or manual copy, reload GNOME Shell on Xorg with `Alt`+`F2`, `r`, Enter, or log out and back in on Wayland before enabling; otherwise `gnome-extensions enable` may report that the extension does not exist.
5. Enable the extension with GNOME Extensions tooling.
6. Open the top-bar menu and verify the mock or configured source data.
7. When updating an already installed development build, reload GNOME Shell after reinstalling because imported extension modules can remain cached across disable/enable cycles.

## Non-Shell Checks

Command:

```sh
tests/run-tests.sh
```

Run focused tests for:

- Snapshot validation and bucket status mapping.
- Overall status derivation from the lowest remaining bucket.
- Stale handling after 2x refresh interval.
- Local timezone reset-time formatting.
- Provider contract validation for success, partial bucket, malformed, unauthenticated, not-configured, rate-limited, and timeout cases.
- ChatGPT-auth enforcement: missing ChatGPT auth, expired ChatGPT auth, API-key auth present, and `OPENAI_API_KEY` present in the environment must not produce a successful real-source snapshot.
- Codex app-server response parsing: `rateLimitsByLimitId.codex.primary` maps to 5-hour data when `windowDurationMins` is 300; `secondary` maps to weekly data when `windowDurationMins` is 10080; `percentRemaining` is `100 - usedPercent`.
- Redaction of authorization headers, cookies, bearer tokens, token-like values, account identifiers, and raw payload fragments.

### Non-Shell Verification Record

Last run in this workspace: 2026-04-30.

Command:

```sh
tests/run-tests.sh
```

Result:

- `formatter.test.js`: PASS
- `balanceSource.test.js`: PASS
- `redaction.test.js`: PASS
- Schema compilation: PASS

Covered behavior:

- Compact panel text for lowest bucket, explicit bucket priority, percent-only, and state-label formats.
- Normal, warning, limit-reached, stale, not-authenticated, partial-bucket, and unavailable/error-safe status mapping.
- 5-hour and weekly menu row formatting, reset timestamp formatting, reset-text fallback, last-refresh formatting, and unavailable reset text.
- Codex app-server parsing from `rateLimitsByLimitId.codex` and `limitId: "codex"` fallback.
- 300-minute primary and 10080-minute secondary window mapping.
- `100 - usedPercent` normalization.
- Missing weekly bucket preservation of valid 5-hour data.
- Malformed bucket handling while preserving valid sibling bucket data.
- ChatGPT auth acceptance, API-key auth rejection, and missing-auth rejection.
- JSON-RPC rate-limit error classification and redaction.
- Stale-after calculation and no-overlap behavior in the mock source.
- Authorization header, cookie, bearer token, token-like value, account identifier, email, high-entropy string, raw-fragment, and long-payload redaction.

Live Codex provider probe:

```sh
CODEX_COMMAND=/home/rado/.nvm/versions/node/v20.19.6/bin/codex gjs -m tests/liveCodexProbe.js
```

Result in this workspace with network access enabled for the probe:

- `overallStatus`: `normal`
- `displayText`: `5h 34%`
- `fiveHourPercentRemaining`: `34`
- `weeklyPercentRemaining`: `81`
- `errorMessage`: `null`

## Manual GNOME Shell Checklist

Status for this implementation pass: pending live GNOME Shell verification. The
workspace can run GJS tests, but it is not a running GNOME Shell session.

- Install extension locally.
- Enable extension and confirm exactly one indicator appears.
- Open menu and confirm both bucket rows appear.
- Trigger manual refresh with normal mock data.
- Trigger manual refresh while refresh is already active and confirm no duplicate work.
- Simulate missing configuration and confirm `not-configured` state.
- Simulate unauthenticated source and confirm `not-authenticated` state.
- Simulate API-key-authenticated Codex and confirm the extension rejects it with a sanitized ChatGPT-login-required state.
- Simulate malformed provider output and confirm non-crashing error state.
- Simulate failed refresh after a previous success and confirm prior values remain visible as stale/failed.
- Simulate stale age after 2x refresh interval.
- Verify sensitive-looking provider errors are redacted in UI and logs.
- Disable extension and confirm panel item, timers, signals, settings bindings, and provider work are cleaned up.
- Repeat enable/disable at least 10 times and confirm no duplicate indicators or timers.
- Reload GNOME Shell or session and confirm extension returns to loading, stale, or refreshed state without crashing.
- Package extension and confirm only required files are included.
- Repeat compatibility smoke checks on GNOME Shell 46, 47, 48, and 49.

### Compact Indicator Expected Outcomes

- Loading with no previous data: one top-bar item with `Codex Loading`.
- Normal mock data: one top-bar item with `5h 87%`.
- Warning mock data: one top-bar item with `5h 20%` and warning styling.
- Limit-reached mock data: one top-bar item with `5h 0%` and limit styling.
- Stale mock data: previous values remain visible with stale styling.
- Unavailable/error mock data: one item remains visible with setup, auth, stale, or error-safe text.

### Refresh Behavior Expected Outcomes

- Manual refresh updates the indicator and menu after a successful provider response.
- Manual refresh while a refresh is active returns the in-flight provider promise and does not start duplicate work.
- Slow or timed-out source maps to a sanitized timeout/error state.
- Failed refresh after a successful snapshot preserves previous values and marks them stale.
- Automatic refresh uses the configured interval and source timeout.

### Source Problem Expected Outcomes

- Missing ChatGPT login maps to `not-authenticated`.
- API-key-authenticated Codex maps to a sanitized ChatGPT-login-required state.
- Missing or invalid Codex command maps to `not-configured`.
- Malformed payload maps to error without crashing and without exposing raw payloads.
- Provider stdout, stderr, JSON-RPC errors, and thrown errors are redacted before UI display.

### Lifecycle Evidence

Pending live verification:

- 10 enable/disable cycles.
- GNOME Shell reload.
- Suspend/resume.
- GNOME Shell 46, 47, 48, and 49 compatibility smoke checks.

## Release Gate

The first release is not complete until a real ChatGPT-authenticated source path is verified and documented. Verification must record:

- Exact source command and retrieval mechanism: `codex app-server --listen stdio://` plus JSON-RPC `account/rateLimits/read`.
- Returned fields for 5-hour percent, weekly percent, and reset data.
- Authentication expectations, including proof that ChatGPT login is required.
- API-key rejection behavior, including behavior when `OPENAI_API_KEY` exists.
- Authorization failure behavior.
- Rate limit behavior.
- Malformed response behavior.
- Timeout behavior.
- Privacy implications and redaction coverage.

## Package Scope

Runtime package contents should be limited to:

- `extension.js`
- `metadata.json`
- `prefs.js`
- `stylesheet.css`
- `lib/balanceSource.js`
- `lib/codexAppServerSource.js`
- `lib/compatibility.js`
- `lib/formatter.js`
- `lib/mockSource.js`
- `lib/model.js`
- `lib/redaction.js`
- `lib/settings.js`
- `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`

Do not package:

- `tests/`
- `specs/`
- `.specify/`
- `.agents/`
- `.git/`
- `.codex`
- `schemas/gschemas.compiled`
- archives, logs, credentials, tokens, cookies, authorization headers, account identifiers, or raw captured provider payloads.
