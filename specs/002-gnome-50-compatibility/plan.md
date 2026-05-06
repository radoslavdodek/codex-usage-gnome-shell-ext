# Implementation Plan: GNOME Shell 50.1 Compatibility

**Branch**: `002-gnome-50-compatibility` | **Date**: 2026-05-06 | **Spec**: `specs/002-gnome-50-compatibility/spec.md`
**Input**: Feature specification from `specs/002-gnome-50-compatibility/spec.md`

## Summary

Extend the Codex Usage Indicator compatibility scope from GNOME Shell 46-49 to GNOME Shell 46-50.1 while preserving existing behavior. The implementation should add the GNOME 50 major-version metadata entry required by GNOME Shell extension compatibility checks, update release-facing documentation and verification records to state that 50.1 is the highest verified point release for this feature, and run the required compatibility/regression matrix. The existing Codex app-server source, status model, privacy behavior, refresh lifecycle, and preferences remain unchanged unless live GNOME Shell 50/50.1 testing exposes a concrete compatibility issue.

## Technical Context

**Language/Version**: GJS JavaScript modules for GNOME Shell extension APIs, targeting GNOME Shell 46, 47, 48, 49, 50, and verified through point release 50.1  
**Primary Dependencies**: GNOME Shell extension APIs, St, Gio, GLib, GObject, GSettings, `Gio.Subprocess`, existing `lib/compatibility.js` helpers; no new third-party dependencies planned  
**Usage Data Source**: Unchanged from the first-release feature: real source uses ChatGPT-authenticated `codex app-server --listen stdio://` and JSON-RPC `account/rateLimits/read`; mock source remains available for development/tests  
**Storage**: Unchanged runtime storage: GSettings for preferences only, in-memory last successful snapshot while enabled, no credential/token/account/raw-payload storage; compatibility verification artifacts live under `specs/002-gnome-50-compatibility/` only  
**Testing**: Existing non-Shell GJS tests via `tests/run-tests.sh`; manual GNOME Shell compatibility matrix for 50 and 50.1; regression smoke matrix for 46, 47, 48, and 49; optional `gnome-shell-test-tool --extension` on Shell 50 where available  
**Target Platform**: GNOME Shell on Linux, versions 46, 47, 48, 49, 50, and point release 50.1  
**Project Type**: GNOME Shell extension  
**Performance Goals**: No new polling or background work; preserve 5-minute default refresh interval, 15-second source timeout, no overlapping refreshes, and no synchronous I/O on the Shell UI path  
**Constraints**: No UI/signals/timers/external access before `enable()`; full cleanup in `disable()`; no telemetry; no third-party transmission; no new credentials or account identifiers in logs/docs; GNOME 40+ metadata uses major-version strings, so `metadata.json` should add `50` while release docs bound verification to 50.1  
**Scale/Scope**: Single-user local top-bar indicator with existing dropdown/preferences, plus compatibility metadata and release verification artifacts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GNOME lifecycle**: PASS. The feature preserves the existing `enable()`/`disable()` ownership model and requires GNOME Shell 50/50.1 verification for UI object creation, timer/source cleanup, settings signal cleanup, provider cancellation, and repeated enable/disable cycles.
- **Glanceable UX**: PASS. No top-bar UX expansion is planned; Shell 50/50.1 must show the same compact indicator and dropdown states as supported earlier versions.
- **Privacy**: PASS. Usage data source and redaction behavior remain unchanged. Compatibility evidence and release docs must not include credentials, tokens, cookies, authorization headers, account identifiers, or raw provider payloads.
- **Data acquisition**: PASS. Usage collection remains isolated behind the existing source modules. The compatibility feature does not add a new acquisition path or change auth behavior.
- **Performance**: PASS. No new polling, synchronous Shell UI I/O, or background work is introduced. Existing timeout, non-overlap, and cleanup behavior must be regression checked.
- **Compatibility**: PASS. Supported Shell versions are explicit: 46, 47, 48, 49, 50, and verified through 50.1. Metadata follows GNOME's major-version convention for 40+ by adding `50`.
- **Testability**: PASS. Existing non-Shell tests remain required, and the feature adds a version/check verification contract for live Shell compatibility evidence.
- **Packaging/configuration**: PASS. Package contents stay runtime-only. No new preferences are introduced.

## Project Structure

### Documentation (this feature)

```text
specs/002-gnome-50-compatibility/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- compatibility-support.md
|   +-- verification-record.md
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

**Structure Decision**: Keep the extension at repository root with the existing GNOME Shell extension package layout. The likely implementation touch points are `metadata.json` for the GNOME 50 metadata entry, `README.md` or release notes for the 50.1 support bound and verification matrix, and possibly `lib/compatibility.js` only if live GNOME Shell 50/50.1 testing reveals an API difference. Runtime source acquisition, formatting, redaction, preferences, and schemas should not change for this compatibility-only feature unless regression testing proves they must.

## Phase 0 Research Summary

- GNOME Shell 50 documentation reports no relevant changes to `metadata.json`, `extension.js`, or `prefs.js`; current extension APIs can be preserved unless testing finds a concrete issue.
- GNOME Shell 40+ metadata should use major-version `shell-version` entries. Therefore `metadata.json` should add `50`, while README/release docs and verification records state that GNOME Shell 50.1 is the highest verified point release for this feature.
- As of 2026-05-06, GNOME 50.1 is a stable point release dated 2026-04-11, and GNOME 50.2 is scheduled for 2026-05-23. This feature must not document 50.2 as verified or claimed.
- Full compatibility evidence is required for GNOME Shell 50 and 50.1; regression smoke evidence is required for GNOME Shell 46 through 49.
- The feature should not alter Codex app-server acquisition, auth-mode enforcement, polling, stale handling, redaction, or display semantics.

See `specs/002-gnome-50-compatibility/research.md` for decisions and source notes.

## Phase 1 Design Summary

- Data entities are defined in `data-model.md`: `SupportedShellVersion`, `RuntimeBehaviorCheck`, `CompatibilityVerificationResult`, `CompatibilityClaim`, and `ReleaseReadinessRecord`.
- Compatibility declaration and package expectations are defined in `contracts/compatibility-support.md`.
- Verification matrix and result format are defined in `contracts/verification-record.md`.
- Development, packaging, install, full Shell 50/50.1 checks, regression checks, and release gate are defined in `quickstart.md`.

## Post-Design Constitution Check

- **GNOME lifecycle**: PASS. Verification contracts explicitly require install, enable, disable, shell reload, and 10-cycle cleanup checks on GNOME Shell 50/50.1.
- **Glanceable UX**: PASS. Contracts require the same compact panel summary and dropdown behavior on new Shell versions.
- **Privacy**: PASS. Verification records and package scope rules forbid sensitive values and raw provider payloads.
- **Data acquisition**: PASS. The design keeps source behavior unchanged and regression checks source failure states rather than adding a new source.
- **Performance**: PASS. No new runtime work is introduced; no-overlap refresh and cleanup remain required checks.
- **Compatibility**: PASS. Metadata, documentation, and verification responsibilities are separated to handle GNOME's major-version metadata convention and the requested 50.1 point-release bound.
- **Testability**: PASS. Non-Shell tests and live Shell matrix checks are both documented with concrete evidence formats.
- **Packaging/configuration**: PASS. Package contract remains runtime-only and no new preferences are introduced.

## Complexity Tracking

No constitution violations require justification.
