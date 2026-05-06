# Implementation Plan: Top-bar Codex Balance Usage Indicator

**Branch**: `001-codex-balance-indicator` | **Date**: 2026-04-30 | **Spec**: `specs/001-codex-balance-indicator/spec.md`
**Input**: Feature specification from `specs/001-codex-balance-indicator/spec.md`

## Summary

Build a GNOME Shell 46-49 extension that shows current Codex Balance usage in the top bar and details in a dropdown. Usage acquisition is isolated behind a replaceable source interface. For the real first-release source, the extension uses the installed Codex CLI app-server protocol authenticated with ChatGPT login, not `OPENAI_API_KEY`: spawn `codex app-server --listen stdio://`, initialize JSON-RPC, call `account/rateLimits/read`, and normalize the returned `rateLimitsByLimitId.codex` snapshot. A mock source remains available for development and tests, but mock-only behavior is not release complete.

## Technical Context

**Language/Version**: GJS JavaScript modules for GNOME Shell 46, 47, 48, and 49  
**Primary Dependencies**: GNOME Shell extension APIs, St, Gio, GLib, GObject, GSettings; `Gio.Subprocess` for the ChatGPT-authenticated Codex app-server request  
**Usage Data Source**: Required real source is `codex app-server --listen stdio://` using Codex ChatGPT login context. The provider sends JSON-RPC `initialize`, then `account/rateLimits/read`, reads `GetAccountRateLimitsResponse.rateLimitsByLimitId.codex` when present, and falls back to `rateLimits` only if it still represents `limitId: "codex"`. It must verify Codex auth mode is `chatgpt`, must reject API-key auth, and must not read or fall back to `OPENAI_API_KEY`.  
**Storage**: GSettings for preferences only; in-memory last successful snapshot while enabled; no credential, token, cookie, account identifier, authorization header, or raw payload storage  
**Testing**: Non-Shell GJS tests for normalization, status mapping, stale handling, command-output parsing, ChatGPT-auth/API-key rejection, and redaction; manual GNOME Shell checklist for lifecycle and UI behavior  
**Target Platform**: GNOME Shell on Linux, versions 46-49  
**Project Type**: GNOME Shell extension  
**Performance Goals**: Default refresh interval 5 minutes, minimum configurable interval 5 minutes, app-server refresh timeout 15 seconds, no overlapping refreshes, no synchronous I/O on the Shell UI path  
**Constraints**: No UI/signals/timers/external access before `enable()`; full cleanup in `disable()`; no telemetry; no third-party transmission; source work must be cancellable and sanitized  
**Scale/Scope**: Single-user local top-bar indicator with dropdown details and optional preferences

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GNOME lifecycle**: PASS. The plan owns panel item, menu rows/actions, settings bindings, refresh timer, cancellable Codex app-server subprocess, and in-memory snapshot only between `enable()` and `disable()`, with cleanup in `disable()`.
- **Glanceable UX**: PASS. One compact top-bar signal is derived from the most constrained bucket by default; bucket details, freshness, and errors live in the dropdown.
- **Privacy**: PASS. No telemetry or third-party transmission. The extension must not persist or display credentials, cookies, tokens, account IDs, authorization headers, or raw payloads. Provider output/errors are redacted before UI/logging.
- **Data acquisition**: PASS. Usage collection is isolated behind `BalanceSource`. The selected real source is ChatGPT-authenticated Codex app-server JSON-RPC, with timeout, cancellation, non-overlap protection, auth failure mapping, malformed output handling, and sanitized errors.
- **Performance**: PASS. Default polling is conservative, refresh is asynchronous/subprocess-backed, and all I/O stays off the Shell UI path.
- **Compatibility**: PASS. `metadata.json` must list GNOME Shell 46-49; version-specific APIs are isolated in small compatibility helpers when needed.
- **Testability**: PASS. Core parsing, formatting, status mapping, stale-data handling, ChatGPT-auth enforcement, API-key rejection, and redaction are testable outside Shell; UI/lifecycle paths use manual GNOME checks.
- **Packaging/configuration**: PASS. Package includes only extension runtime files. Preferences are limited to meaningful display, polling, threshold, and Codex command path choices with invalid-config handling.

## Project Structure

### Documentation (this feature)

```text
specs/001-codex-balance-indicator/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- balance-source.md
|   +-- ui-state.md
+-- tasks.md
```

### Source Code (repository root)

```text
extension.js
metadata.json
prefs.js
stylesheet.css
schemas/
  org.gnome.shell.extensions.codex-usage.gschema.xml
lib/
  balanceSource.js
  codexAppServerSource.js
  mockSource.js
  model.js
  formatter.js
  redaction.js
  settings.js
  compatibility.js
tests/
  fixtures/
  balanceSource.test.js
  formatter.test.js
  redaction.test.js
```

**Structure Decision**: Keep the extension at repository root for standard GNOME local installation and packaging. Put risky source acquisition in `lib/codexAppServerSource.js`, pure normalization/formatting/redaction logic in small testable modules, and Shell-owned UI/lifecycle code in `extension.js`. Preferences and schemas are included because Codex command path, refresh interval, warning threshold, display format, and bucket priority are meaningful first-release controls.

## Phase 0 Research Summary

- Codex supports ChatGPT subscription authentication and API-key authentication as separate modes. This feature must use the ChatGPT mode only.
- Current official docs point users to the Codex usage dashboard for current limits and mention `/status` during an active CLI session. The installed Codex CLI `0.125.0` also exposes an app-server JSON-RPC method named `account/rateLimits/read`.
- Feasibility was tested on 2026-04-30 with Codex CLI `0.125.0` and ChatGPT login: `account/rateLimits/read` returned `rateLimits` plus `rateLimitsByLimitId.codex`; the Codex snapshot included `primary` and `secondary` windows, both with numeric `usedPercent` and reset timestamps.
- The tested `primary.windowDurationMins` was `300`, which maps to the 5-hour bucket. The tested `secondary.windowDurationMins` was `10080`, which maps to the weekly bucket.
- Selected plan: invoke Codex app-server as a cancellable local subprocess, use `account/rateLimits/read`, normalize `usedPercent` to percent remaining as `100 - usedPercent`, map reset timestamps to local time, and treat missing ChatGPT auth, API-key auth, malformed output, timeout, and rate limiting as safe states.

See `specs/001-codex-balance-indicator/research.md` for decisions and source notes.

## Phase 1 Design Summary

- Data entities are defined in `data-model.md`: `CodexBalanceSnapshot`, `BalanceBucket`, `DataSourceConfig`, `RefreshState`, and `DisplayPreference`.
- Source interface and JSON contract are defined in `contracts/balance-source.md`, including the Codex app-server JSON-RPC method, ChatGPT-auth-only rules, and API-key rejection.
- UI behavior is defined in `contracts/ui-state.md`.
- Quickstart and release gate are defined in `quickstart.md`.

## Post-Design Constitution Check

- **GNOME lifecycle**: PASS. Design keeps timers, subprocesses, cancellables, settings, and UI ownership explicit.
- **Glanceable UX**: PASS. Contracts preserve one compact panel item and detailed menu rows.
- **Privacy**: PASS. ChatGPT auth is required, API-key fallback is forbidden, credentials remain outside extension storage, and redaction is mandatory.
- **Data acquisition**: PASS. The Codex app-server source is replaceable and contract-bound; mock data cannot satisfy release completion.
- **Performance**: PASS. Poll interval, timeout, cancellation, and non-overlap behavior are specified.
- **Compatibility**: PASS. GNOME Shell 46-49 is explicit.
- **Testability**: PASS. Non-Shell and manual verification paths are documented.
- **Packaging/configuration**: PASS. Runtime package scope and meaningful preferences are bounded.

## Complexity Tracking

No constitution violations require justification.
