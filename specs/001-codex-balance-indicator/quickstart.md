# Quickstart: Top-bar Codex Balance Usage Indicator

## Development Setup

1. Install or use a GNOME Shell environment for one of the supported versions: 46, 47, 48, or 49.
2. Keep the extension source at repository root with `metadata.json` and `extension.js`.
3. Use the mock provider first to verify UI, lifecycle, normalization, stale handling, and redaction without needing a real Codex source.
4. Configure the real source to use the installed Codex CLI app server: `codex app-server --listen stdio://`.
5. Before release completion, verify `account/rateLimits/read` exposes the 300-minute and 10080-minute Codex windows and rejects API-key authentication.

## Local Install Flow

1. Ensure `metadata.json` lists GNOME Shell versions `46`, `47`, `48`, and `49`.
2. Copy or symlink the extension directory into the local GNOME extensions directory using the UUID from `metadata.json`.
3. Compile schemas if `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml` exists.
4. Enable the extension with GNOME Extensions tooling.
5. Open the top-bar menu and verify the mock or configured source data.

## Non-Shell Checks

Run focused tests for:

- Snapshot validation and bucket status mapping.
- Overall status derivation from the lowest remaining bucket.
- Stale handling after 2x refresh interval.
- Local timezone reset-time formatting.
- Provider contract validation for success, partial bucket, malformed, unauthenticated, not-configured, rate-limited, and timeout cases.
- ChatGPT-auth enforcement: missing ChatGPT auth, expired ChatGPT auth, API-key auth present, and `OPENAI_API_KEY` present in the environment must not produce a successful real-source snapshot.
- Codex app-server response parsing: `rateLimitsByLimitId.codex.primary` maps to 5-hour data when `windowDurationMins` is 300; `secondary` maps to weekly data when `windowDurationMins` is 10080; `percentRemaining` is `100 - usedPercent`.
- Redaction of authorization headers, cookies, bearer tokens, token-like values, account identifiers, and raw payload fragments.

## Manual GNOME Shell Checklist

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
