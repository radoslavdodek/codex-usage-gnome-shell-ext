# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: GJS for GNOME Shell extension APIs, [GNOME Shell versions or NEEDS CLARIFICATION]  
**Primary Dependencies**: [GNOME Shell/St APIs, Gio/GLib/GObject, optional justified deps, or NEEDS CLARIFICATION]  
**Usage Data Source**: [local file, local CLI, official config, user endpoint, or NEEDS CLARIFICATION]  
**Storage**: [GSettings/schema, local cache, none, or NEEDS CLARIFICATION]  
**Testing**: [GJS/unit parser tests, manual GNOME Shell checklist, or NEEDS CLARIFICATION]  
**Target Platform**: GNOME Shell on Linux, [supported Shell versions or NEEDS CLARIFICATION]
**Project Type**: GNOME Shell extension  
**Performance Goals**: [poll interval, max wakeups, non-blocking UI behavior, or NEEDS CLARIFICATION]  
**Constraints**: No UI/signals/timers/external access before enable(); full cleanup in disable(); no Shell UI blocking I/O; no telemetry  
**Scale/Scope**: Single-user local top-bar indicator with dropdown/preferences as specified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GNOME lifecycle**: Plan identifies every UI object, signal, timer, subprocess,
  settings binding, cache, and cleanup path owned between `enable()` and `disable()`.
- **Glanceable UX**: Plan defines the single default top-bar signal and moves details
  to menu/preferences.
- **Privacy**: Plan confirms no telemetry or third-party transmission and documents
  credential redaction/storage behavior when credentials are involved.
- **Data acquisition**: Plan isolates usage collection from rendering, identifies the
  data source, timeouts, error handling, cleanup, and all failure states.
- **Performance**: Plan uses conservative polling and avoids synchronous I/O on the
  Shell UI path.
- **Compatibility**: Plan states supported GNOME Shell versions and any compatibility
  helper boundaries.
- **Testability**: Plan includes non-Shell tests for parsing/formatting changes and
  a GNOME Shell manual verification checklist.
- **Packaging/configuration**: Plan keeps package contents minimal and documents any
  meaningful preferences plus invalid-config handling.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
extension.js              # GNOME Shell lifecycle entry point
metadata.json             # Extension metadata and supported shell-version list
prefs.js                  # Optional preferences UI, only when needed
stylesheet.css            # Optional extension styles, only when needed
schemas/                  # Optional GSettings schemas, only when needed
icons/                    # Optional icons, only when needed
locale/                   # Optional translations, only when needed
lib/                      # Small GJS modules, e.g. usage collection/formatting
tests/                    # Non-Shell parser/formatter tests and fixtures
specs/[###-feature]/      # Spec Kit feature artifacts
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
