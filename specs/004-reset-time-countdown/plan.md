# Implementation Plan: Reset Time Countdown

**Branch**: `004-reset-time-countdown` | **Date**: 2026-05-08 | **Spec**: `specs/004-reset-time-countdown/spec.md`
**Input**: Feature specification from `specs/004-reset-time-countdown/spec.md`

## Summary

Replace the primary 5-hour and weekly reset labels in the usage menu with relative countdown text such as `Resets in 1 minute`, `Resets in 2h 15m`, `Resets in less than 1 minute`, `Resets in 2d 13h 15m`, and `Reset due` for elapsed reset times. The implementation should change presentation only: keep Codex usage acquisition, bucket normalization, storage, authentication, pause/refresh settings, and panel display selection unchanged. Countdown formatting belongs in `lib/formatter.js` with deterministic tests, and the menu should repaint countdown labels at minute granularity while open so visible text remains understandable without forcing a data refresh.

## Technical Context

**Language/Version**: GJS JavaScript modules for GNOME Shell extension APIs, targeting GNOME Shell 46, 47, 48, 49, and 50 as listed in `metadata.json`  
**Primary Dependencies**: GNOME Shell extension APIs, `PopupMenu`, St, Gio, GLib, GObject, existing `lib/compatibility.js` helpers; no new third-party dependencies planned  
**Usage Data Source**: Unchanged real source uses ChatGPT-authenticated `codex app-server --listen stdio://` and JSON-RPC `account/rateLimits/read`; mock source remains available for development/tests  
**Storage**: No new storage; reset timestamps remain in snapshot bucket fields as `resetAtUnix`, fallback reset text remains transient as `resetText`, settings remain unchanged  
**Testing**: Existing non-Shell GJS tests via `tests/run-tests.sh`, with added formatter coverage for relative reset boundaries including multi-day weekly countdowns; manual GNOME Shell checklist for menu display, live countdown repaint, stale/error/loading/auth/config states, refresh pause, and lifecycle cleanup  
**Target Platform**: GNOME Shell on Linux, versions 46, 47, 48, 49, and 50  
**Project Type**: GNOME Shell extension  
**Performance Goals**: No additional provider calls, subprocesses, file reads, network requests, or storage writes; at most one minute-level GLib timeout while the menu is open; timeout cleared on menu close and `disable()`; no synchronous I/O on the Shell UI path  
**Constraints**: No UI/signals/timers/external access before `enable()`; full cleanup in `disable()`; no Shell UI blocking I/O; no telemetry; no third-party transmission; formatting must never produce negative countdowns  
**Scale/Scope**: Single-user local top-bar indicator with existing dropdown/preferences, affecting only reset text for the 5-hour and weekly usage limit rows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GNOME lifecycle**: PASS. UI changes are limited to existing menu row rendering while enabled. The only new runtime ownership is a menu open-state signal and optional minute repaint timeout, both created after `enable()` and cleared on menu close and `disable()`.
- **Glanceable UX**: PASS. The top-bar signal remains unchanged. Reset timing is still shown only in the dropdown usage details and becomes more glanceable, including weekly resets more than 24 hours away.
- **Privacy**: PASS. The feature does not change usage acquisition, auth handling, redaction, telemetry behavior, storage, or any displayed account/credential fields.
- **Data acquisition**: PASS. Provider/source modules remain isolated from rendering. Existing `resetAtUnix` data remains authoritative; the feature only changes formatting.
- **Performance**: PASS. Countdown updates use the existing in-memory snapshot and do not refresh usage data. The optional repaint timer runs only while the menu is open and at minute granularity.
- **Compatibility**: PASS. The plan uses existing GJS/GLib/PopupMenu/St patterns already present for GNOME Shell 46-50 support.
- **Testability**: PASS. Relative reset formatting is pure enough to test with injected `nowUnix` values outside GNOME Shell. Manual verification covers Shell menu repaint and lifecycle cleanup.
- **Packaging/configuration**: PASS. No package contents, schemas, preferences, or configuration contracts are added.

## Project Structure

### Documentation (this feature)

```text
specs/004-reset-time-countdown/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- reset-countdown-display.md
|   +-- formatter-contract.md
```

### Source Code (repository root)

```text
extension.js
metadata.json
prefs.js
stylesheet.css
README.md
schemas/
  org.gnome.shell.extensions.codex-usage.gschema.xml
lib/
  balanceSource.js
  codexAppServerSource.js
  compatibility.js
  formatter.js
  mockSource.js
  model.js
  redaction.js
  settings.js
tests/
  fixtures/
  balanceSource.test.js
  formatter.test.js
  redaction.test.js
  refreshPause.test.js
  settings.test.js
  run-tests.sh
```

**Structure Decision**: Keep the existing GNOME Shell extension package layout at repository root. The expected implementation touch points are `lib/formatter.js` for countdown formatting, `tests/formatter.test.js` for deterministic boundary coverage, and `extension.js` only if menu-open minute repaint is needed to keep visible countdown rows current. Source acquisition modules, model normalization, settings schema, preferences, and packaging files should remain unchanged unless implementation reveals a narrow integration issue.

## Phase 0 Research Summary

- Reset countdown formatting should be handled in `lib/formatter.js`, not in provider modules or `extension.js`, so reset presentation is shared by menu rows and covered by non-Shell tests.
- `resetAtUnix` should remain the authoritative input. Fallback `resetText` should still be used only when no valid timestamp exists, preserving existing unavailable/fallback behavior.
- Formatting should floor future durations to whole minutes, use singular wording for exactly one minute, use compact hour/minute notation for same-day durations of at least one hour, include days for durations longer than 24 hours, omit zero-value lower units, show `Resets in less than 1 minute` for future values under one minute, and show `Reset due` for due, elapsed, or stale timestamps that are not in the future.
- The menu can remain accurate while open by reconnecting rendering to current time only at minute granularity, without starting provider refreshes or storing derived countdown text.
- Existing absolute date formatting should stay available for unrelated metadata such as `Last refresh`; the feature only replaces reset labels for 5-hour and weekly bucket rows.
- Non-Shell tests should cover boundary values using injected `nowUnix`; manual GNOME Shell verification should cover both live provider and mock/reset states plus pause, stale, unavailable, auth/config, and lifecycle behavior.

See `specs/004-reset-time-countdown/research.md` for decisions and source notes.

## Phase 1 Design Summary

- Data entities are defined in `data-model.md`: `UsageLimitReset`, `RelativeResetText`, `UsageDetailDisplay`, and `MenuCountdownRefresh`.
- Menu behavior and lifecycle expectations are defined in `contracts/reset-countdown-display.md`.
- Formatter input/output expectations are defined in `contracts/formatter-contract.md`.
- Development, automated checks, mock/manual verification, and lifecycle checks are defined in `quickstart.md`.
- Agent context already points at `specs/004-reset-time-countdown/plan.md` in `AGENTS.md`; no further context-file path change is required.

## Post-Design Constitution Check

- **GNOME lifecycle**: PASS. Contracts require any countdown repaint signal/timer to be owned only while enabled, to run only while the menu is open, and to be removed on menu close and `disable()`.
- **Glanceable UX**: PASS. The design preserves the compact top bar and improves dropdown reset readability without adding new controls.
- **Privacy**: PASS. Contracts explicitly keep usage data source behavior, credentials, tokens, account identifiers, and raw provider payload handling unchanged.
- **Data acquisition**: PASS. No new acquisition path is introduced; countdown text is derived from existing normalized bucket fields.
- **Performance**: PASS. No background provider work is added. The only optional runtime work is a single open-menu minute repaint based on in-memory state.
- **Compatibility**: PASS. The design uses existing GJS Date/GLib and GNOME Shell menu APIs available across the supported Shell range.
- **Testability**: PASS. Formatter boundaries, including multi-day reset text, are covered outside Shell with fixed timestamps, while menu repaint and lifecycle cleanup are covered by manual GNOME Shell verification.
- **Packaging/configuration**: PASS. The package, settings schema, preferences, and install workflow remain unchanged.

## Complexity Tracking

No constitution violations require justification.
