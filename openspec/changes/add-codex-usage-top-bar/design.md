## Context

This repository is currently an OpenSpec workspace for a new GNOME Shell extension. The extension should provide at-a-glance Codex usage visibility in the GNOME top bar and a more detailed menu when clicked.

Current GNOME Shell extension conventions use ES modules for GNOME Shell 45 and later. The extension should ship the normal `metadata.json` and `extension.js` entry points, add its indicator through GNOME Shell panel APIs, and clean up all actors, timers, and subprocesses during `disable()`.

The local Codex CLI app-server schema includes `account/read`, `account/login/start`, and `account/rateLimits/read` JSON-RPC methods. `account/read` exposes ChatGPT account state, including email and plan type. `account/login/start` supports a Codex-managed ChatGPT sign-in flow that returns either an auth URL or device-code verification details. `account/rateLimits/read` returns rate-limit windows with `usedPercent`, `resetsAt`, and `windowDurationMins`, including multi-bucket data keyed by limit id such as `codex`. That shape maps directly to the requested 5-hour and weekly usage display, but the extension must tolerate the app-server, account, or subscription data being unavailable.

## Goals / Non-Goals

**Goals:**

- Show compact Codex usage percentages for the 5-hour and weekly windows in the top bar.
- Show reset times, last update time, ChatGPT account/subscription state, and provider/error status in the dropdown.
- Allow the user to start ChatGPT subscription sign-in through Codex-managed browser or device-code authentication.
- Refresh usage automatically without creating noticeable shell overhead.
- Follow GNOME Shell extension lifecycle and packaging conventions.
- Include installation and development instructions for local testing.

**Non-Goals:**

- Implement billing, subscription purchase, plan changes, password collection, or direct raw-token management.
- Provide a large preferences application in the first version.
- Persist historical usage charts.
- Poll more frequently than needed for at-a-glance quota awareness.

## Decisions

1. Use a GNOME Shell top-bar indicator rather than a Quick Settings tile.

   The primary workflow is continuous at-a-glance visibility while coding. A `PanelMenu.Button` in the top bar supports a compact label and a click menu without requiring users to open Quick Settings. Quick Settings remains a future option if the extension grows controls beyond visibility.

2. Target modern GNOME Shell ES module conventions.

   The implementation will use `extension.js` with a default `Extension` subclass, resource imports such as `resource:///org/gnome/shell/ui/main.js`, and explicit cleanup in `disable()`. The supported shell versions will be declared in `metadata.json`.

3. Split UI, data retrieval, and normalization.

   Proposed source layout:

   - `extension.js`: lifecycle, indicator creation, cleanup.
   - `indicator.js`: top-bar label, menu rows, manual refresh action.
   - `authProvider.js`: reads ChatGPT account state and starts delegated sign-in.
   - `usageProvider.js`: calls the Codex usage source with timeout and parses output.
   - `usageModel.js`: normalizes account and rate-limit windows into `{account, fiveHour, weekly, lastUpdated, status}`.
   - `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`: stores the Codex command path and refresh interval.
   - `stylesheet.css`: compact spacing and severity classes.
   - `README.md`: install, reload, debug, and development instructions.

   This keeps GNOME actor code separate from Codex protocol details and makes the normalizer easy to unit-check outside GNOME Shell.

4. Delegate ChatGPT subscription sign-in to Codex/OpenAI.

   The extension will not render a password form and will not store ChatGPT credentials or raw authentication tokens. When `account/read` reports that OpenAI/ChatGPT authentication is required, the dropdown will show a sign-in action. Activating it will call `account/login/start` with the ChatGPT login type, open the returned `authUrl` in the user's default browser, and show pending/cancel/error state in the menu. If the provider returns device-code details, the dropdown will show the one-time code and open the verification URL.

   The provider will observe login completion through the app-server notification stream when available, and it may also refresh account state after sign-in is started. On successful sign-in, the dropdown should show the ChatGPT account email and plan type when returned by `account/read`. The `chatgptAuthTokens` login mode is marked internal/unstable in the local schema, so the extension will not use it.

5. Use Codex rate-limit data as the preferred provider contract.

   The provider will prefer Codex app-server rate-limit data when available. It will select the Codex bucket from `rateLimitsByLimitId.codex` when present, otherwise fall back to the compatible `rateLimits` field. Windows will be identified by `windowDurationMins`: `300` for the 5-hour window and `10080` for the weekly window. If durations are absent, the provider may map `primary` to 5-hour and `secondary` to weekly only when both windows are present.

   The extension should not assume the app-server is always running. A provider failure becomes a visible unavailable state, not a shell error.

6. Refresh every 5 minutes by default, plus on menu open or manual refresh.

   Five minutes is frequent enough for quota awareness and avoids excessive subprocess or app-server work. The implementation will use a `GLib.timeout_add_seconds()` source and remove it on disable. The menu will include a refresh action that is rate-limited so repeated clicks cannot spawn overlapping refreshes.

7. Keep the top-bar label terse and status-oriented.

   Normal state format should fit typical GNOME panels, for example `5h 42%  W 61%`. The label may add warning styling at high usage levels, but reset timestamps belong in the dropdown to keep the panel compact.

## Risks / Trade-offs

- Codex app-server protocol availability can vary by Codex version or session state -> keep provider code isolated, include clear unavailable UI, and document the expected source.
- ChatGPT sign-in is security-sensitive -> delegate authentication to Codex/OpenAI browser or device-code flows, avoid password/token storage, and show only account metadata such as email and plan type.
- Browser launch or device-code sign-in can fail or be canceled -> keep the menu in a retryable signed-out state and surface a concise error.
- GNOME Shell does not inherit interactive shell PATH reliably -> allow the Codex command path to be configured with GSettings, document it, and handle command-not-found as an unavailable state.
- Subprocess polling can affect shell responsiveness if mishandled -> use async subprocess calls, a timeout, one in-flight refresh at a time, and cleanup in `disable()`.
- GNOME Shell API compatibility changes across versions -> declare supported shell versions and keep imports aligned with ES module extension conventions.
- Usage windows may be missing or renamed -> normalize by duration where possible and surface missing fields as unknown rather than guessing misleading values.

## Migration Plan

This is a new extension, so no data migration is required. Implementation can be developed as an unpacked extension under `~/.local/share/gnome-shell/extensions/<uuid>/`, enabled with `gnome-extensions`, and removed by disabling and deleting that extension directory.

## Open Questions

- Confirm the exact Codex app-server lifecycle expected outside an active Codex UI session, including whether login completion notifications are available through the chosen transport.
- Decide the extension UUID before implementation, for example `codex-usage@rado.dev`.
