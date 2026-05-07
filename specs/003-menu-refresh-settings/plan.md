# Implementation Plan: Menu Refresh Settings

**Branch**: `004-menu-refresh-settings` | **Date**: 2026-05-06 | **Spec**: `specs/003-menu-refresh-settings/spec.md`
**Input**: Feature specification from `specs/003-menu-refresh-settings/spec.md`

## Summary

Add refresh configuration directly to the Codex Usage Indicator menu so users can view and change the automatic refresh interval from 1 through 30 whole minutes and toggle a persistent refresh pause state. The implementation should reuse the existing GNOME Shell indicator menu, GSettings schema, settings normalization, GLib timer lifecycle, and source abstraction. Usage acquisition, authentication, privacy behavior, formatting, and source selection remain unchanged except that pause intentionally suppresses automatic and manual refresh attempts and forces the panel caption to exactly `Paused`.

## Technical Context

**Language/Version**: GJS JavaScript modules for GNOME Shell extension APIs, targeting GNOME Shell 46, 47, 48, 49, 50, and verified through point release 50.1  
**Primary Dependencies**: GNOME Shell extension APIs, `PopupMenu`, St, Gio, GLib, GObject, GSettings, existing `lib/compatibility.js` helpers; no new third-party dependencies planned  
**Usage Data Source**: Unchanged real source uses ChatGPT-authenticated `codex app-server --listen stdio://` and JSON-RPC `account/rateLimits/read`; mock source remains available for development/tests  
**Storage**: GSettings for refresh interval and pause settings, plus existing preferences; in-memory snapshot and refresh state while enabled; no credential/token/account/raw-payload storage  
**Testing**: Existing non-Shell GJS tests via `tests/run-tests.sh`, with added settings normalization and pause helper coverage; manual GNOME Shell menu/lifecycle verification across supported Shell versions  
**Target Platform**: GNOME Shell on Linux, versions 46, 47, 48, 49, 50, and point release 50.1  
**Project Type**: GNOME Shell extension  
**Performance Goals**: Default refresh interval remains 5 minutes; user-configurable range becomes 1 through 30 minutes; provider timeout remains 15 seconds; no overlapping refreshes; pause removes automatic refresh wakeups; no synchronous I/O on the Shell UI path  
**Constraints**: No UI/signals/timers/external access before `enable()`; full cleanup in `disable()`; no telemetry; no third-party transmission; settings changes must not duplicate timers, menu rows, indicators, settings signals, or provider work  
**Scale/Scope**: Single-user local top-bar indicator with existing dropdown/preferences plus menu-visible refresh controls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GNOME lifecycle**: PASS. Refresh controls are created only while rebuilding the enabled indicator menu. The plan requires owned menu actors, settings signals, GLib timer sources, cancellables, and source state to be destroyed or cleared in `disable()`.
- **Glanceable UX**: PASS. The top bar remains one compact label. Pause intentionally changes the panel caption to `Paused`; interval details stay in the menu.
- **Privacy**: PASS. The feature does not change usage acquisition, auth handling, redaction, telemetry behavior, or storage of sensitive values.
- **Data acquisition**: PASS. Source modules remain isolated from rendering. Pause only gates whether refresh work starts and cancels/suppresses in-progress refresh display when needed.
- **Performance**: PASS. The default remains conservative at 5 minutes. The 1-minute minimum is user-selected, bounded, and still uses non-overlapping async refresh with the existing timeout. Pause removes automatic refresh timers.
- **Compatibility**: PASS. The plan uses existing GNOME Shell `PopupMenu`, St, Gio, GLib, and GSettings patterns already present in the codebase for Shell 46-50/50.1 support.
- **Testability**: PASS. Settings range/default/pause behavior can be tested outside Shell, while menu reachability, panel caption, timer ownership, and lifecycle cleanup are covered by manual GNOME Shell verification.
- **Packaging/configuration**: PASS. Package contents stay runtime-only. Configuration changes are limited to meaningful refresh interval and pause settings.

## Project Structure

### Documentation (this feature)

```text
specs/003-menu-refresh-settings/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- menu-refresh-settings.md
|   +-- settings-schema.md
+-- tasks.md
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
  run-tests.sh
```

**Structure Decision**: Keep the existing GNOME Shell extension package layout at repository root. The expected implementation touch points are `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml` for the narrowed interval range and new pause key, `lib/settings.js` for normalization/config wiring, `extension.js` for menu controls, timer rescheduling, pause rendering, and refresh gating, `prefs.js` for keeping preferences aligned with the new range/pause setting, tests under `tests/`, and README/manual verification updates. Source acquisition modules should not change unless pause cancellation exposes a concrete lifecycle issue.

## Phase 0 Research Summary

- GNOME Shell menu controls should be added to the existing indicator menu using Shell `PopupMenu`/St primitives rather than GTK widgets or a separate Quick Settings surface.
- Refresh pause should be persisted as a GSettings boolean, should remove automatic timers, should suppress manual refresh, and should force the panel caption to exactly `Paused`.
- The existing `refresh-interval-seconds` key should be retained, but its effective range should become 60-1800 seconds and it should be presented as 1-30 whole minutes.
- Settings normalization should remain centralized in `lib/settings.js`, including the current code/schema default mismatch for refresh interval, which should be resolved to 300 seconds.
- The menu rebuild path must append refresh controls independently from snapshot-specific rows so settings stay reachable during loading and error states.
- Non-Shell tests should cover settings normalization and pure pause/interval behavior; live Shell verification should cover menu reachability, panel caption, refresh suppression, and lifecycle cleanup.

See `specs/003-menu-refresh-settings/research.md` for decisions and source notes.

## Phase 1 Design Summary

- Data entities are defined in `data-model.md`: `RefreshSettings`, `RefreshTimerState`, `RefreshPauseState`, `UsageDisplayState`, and `MenuConfigurationEntry`.
- Menu behavior and lifecycle expectations are defined in `contracts/menu-refresh-settings.md`.
- Persistent settings schema expectations are defined in `contracts/settings-schema.md`.
- Development, install, automated checks, direct settings smoke commands, and manual verification are defined in `quickstart.md`.
- Agent context was updated in `AGENTS.md` to point at this implementation plan.

## Post-Design Constitution Check

- **GNOME lifecycle**: PASS. Contracts require menu controls, timer IDs, cancellables, settings signals, and source work to be owned only while enabled and cleaned up during disable.
- **Glanceable UX**: PASS. The design preserves the compact panel and adds only the requested `Paused` caption override.
- **Privacy**: PASS. Contracts explicitly keep usage data, credentials, tokens, account identifiers, and raw provider payloads out of settings, menu text, and verification artifacts.
- **Data acquisition**: PASS. No new acquisition path is introduced; pause gates existing refresh entry points.
- **Performance**: PASS. No background work is added. Timer rescheduling remains single-source, and pause removes automatic wakeups.
- **Compatibility**: PASS. The design uses existing GNOME Shell menu/settings APIs already compatible with the supported Shell range.
- **Testability**: PASS. Automated and manual verification responsibilities are separated with concrete acceptance checks.
- **Packaging/configuration**: PASS. The package remains runtime-only and the only new preference is the requested refresh pause control.

## Complexity Tracking

No constitution violations require justification.
