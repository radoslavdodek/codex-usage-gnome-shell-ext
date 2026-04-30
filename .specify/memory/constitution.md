<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles: Placeholder principles -> Codex Usage Indicator principles I-X
Added sections: Operational Constraints; Development Workflow
Removed sections: None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ✅ reviewed .specify/templates/commands/*.md (directory absent)
- ✅ reviewed .specify/extensions/git/commands/*.md
- ✅ reviewed README.md
- ✅ reviewed AGENTS.md
Follow-up TODOs: None
-->
# Codex Usage Indicator Constitution

## Core Principles

### I. GNOME-Native Behavior Is Mandatory
The extension MUST follow GNOME Shell extension architecture and lifecycle rules. It
MUST use GJS and GNOME Shell extension APIs appropriate for every supported GNOME
Shell version. It MUST NOT create UI objects, connect signals, start timers, or
access external resources before `enable()` is called. It MUST clean up all UI
objects, timers, subprocesses, signals, settings bindings, and cached state in
`disable()`. The top-bar indicator MUST feel consistent with GNOME Shell:
compact, readable, accessible, and unobtrusive.

Rationale: GNOME Shell extensions run inside the Shell process; lifecycle mistakes
can destabilize the desktop.

### II. Minimal, Glanceable Top-Bar UX
The panel item MUST show only the most important Codex usage signal by default.
The default display MUST avoid clutter, excessive text, animation, and distracting
color. Detailed usage information MUST live in a dropdown menu or preferences, not
be forced into the top bar. The extension MUST degrade gracefully when usage data
is unavailable, stale, rate-limited, or malformed. Users MUST be able to
distinguish loading, valid data, stale data, unavailable data, and
authentication/configuration problems.

Rationale: The top bar is shared system space and must remain calm, glanceable,
and truthful.

### III. Privacy and Local-First Handling
The extension MUST NOT transmit Codex usage data, account data, tokens, machine
identifiers, or telemetry to any third party. Credentials and tokens MUST NOT be
hardcoded, logged, committed, displayed in stack traces, or stored in plain text.
Implementations MUST prefer local files, local CLI output, official local
configuration, or user-provided endpoints over unofficial scraping. Logs MUST be
safe for public bug reports and MUST redact sensitive values. The extension MUST
NOT collect analytics.

Rationale: Codex usage and account state are private user data.

### IV. Safe Codex Usage Data Acquisition
UI rendering and usage-data collection MUST be separated. Usage collection MUST be
isolated in a dedicated module with a small interface so the data source can
change later. The extension MUST avoid blocking the GNOME Shell main thread. Any
subprocess, file read, network request, or polling loop MUST have timeouts, error
handling, and cleanup. Polling MUST be conservative by default and configurable
when meaningful. Failed refreshes MUST NOT crash GNOME Shell or leave the
indicator in a misleading state.

Rationale: Data acquisition is the highest-risk behavior because it can block,
fail, expose secrets, or outlive the extension lifecycle.

### V. Performance and Reliability
The extension MUST keep memory, CPU, and wakeups low. It MUST NOT poll
aggressively. It MUST avoid synchronous I/O on the Shell UI path. It MUST tolerate
suspend/resume, network changes, missing dependencies, missing configuration, and
GNOME Shell reloads. It MUST NOT spam notifications, logs, or the journal. The
indicator MUST remain stable across repeated enable/disable cycles.

Rationale: A panel indicator runs continuously and must not degrade the desktop.

### VI. Version Compatibility and Maintainability
Supported GNOME Shell versions MUST be explicit in `metadata.json` and validated
during development. Version-specific APIs MUST be isolated behind compatibility
helpers when practical. The codebase MUST stay small, modular, and easy to
review. Dependencies, build tools, transpilers, and bundled libraries MUST be
avoided unless a feature spec justifies them. Clear GJS code is preferred over
clever abstractions.

Rationale: Reviewability and version clarity reduce breakage across GNOME Shell
releases.

### VII. Testability and Manual Verification
Every feature spec MUST include acceptance criteria that can be manually verified
in GNOME Shell. Core usage parsing and formatting logic MUST be testable without
running GNOME Shell. The project MUST include a manual test checklist covering
install, enable, disable, reload, missing config, failed data refresh, stale data,
and normal usage display. Bug fixes MUST include regression checks where
feasible.

Rationale: Shell behavior needs manual verification, while parsing and formatting
must be covered outside the Shell for fast regression checks.

### VIII. Packaging and Review Readiness
The extension package MUST contain only necessary files. Required files MUST
include `metadata.json` and `extension.js`; optional `prefs.js`, `stylesheet.css`,
schemas, icons, and locale files MUST be included only when needed. The project
MUST support local development installation and packaging through standard GNOME
extension workflows. The implementation MUST be suitable for future submission to
extensions.gnome.org and follow GNOME extension review expectations.

Rationale: A clean package improves local installation, review, and distribution.

### IX. User Control and Configuration
Preferences MUST be provided only for meaningful choices, such as refresh
interval, display format, warning thresholds, or data source configuration.
Defaults MUST be safe and useful without extensive setup. Invalid preferences MUST
be rejected or handled gracefully. Configuration errors MUST be actionable and
understandable.

Rationale: Configuration must improve control without creating unnecessary setup
burden or ambiguous failure states.

### X. Specification Discipline
Specifications MUST describe user-visible behavior before implementation details.
Implementation plans MUST identify the Codex usage data source, failure modes,
GNOME Shell version targets, and privacy implications. Tasks MUST be small enough
for an AI coding agent to implement and verify incrementally. No implementation
MUST proceed unless it satisfies this constitution or explicitly amends the
constitution first.

Rationale: The specification workflow is the enforcement point for stability,
privacy, and review readiness.

## Operational Constraints

The runtime technology is GNOME Shell extension code written in GJS. Any feature
that introduces subprocess access, file access, network access, polling, settings,
or external dependencies MUST document lifecycle ownership and cleanup behavior.
Any use of credentials or user-provided endpoints MUST document storage,
redaction, and failure handling before implementation. Supported GNOME Shell
versions MUST be listed in `metadata.json` and in each implementation plan that
depends on version-specific APIs.

The top-bar indicator is the primary user interface. It MUST remain compact and
must reserve detailed information for the menu or preferences. State labels,
icons, and formatting MUST make loading, valid, stale, unavailable, and
authentication/configuration states distinguishable.

## Development Workflow

Feature specs MUST define user-visible behavior, GNOME Shell manual acceptance
criteria, and relevant failure states. Implementation plans MUST pass a
Constitution Check before research and again after design. That check MUST cover
GNOME lifecycle, privacy, data-source isolation, non-blocking behavior, polling,
performance, compatibility, testing, packaging, and configuration.

Tasks MUST be organized so lifecycle scaffolding, data collection, UI rendering,
preferences, tests, and manual verification can be implemented and reviewed in
small increments. Core parsing and formatting tests MUST be included when a
feature changes usage data interpretation or display. Manual verification MUST be
recorded for install, enable, disable, reload, missing config, failed refresh,
stale data, and normal usage display whenever those paths are affected.

## Governance

This constitution is the source of truth for architectural and quality decisions.
Feature specs, implementation plans, tasks, and code reviews MUST verify
compliance with these principles. Any shortcut that risks GNOME Shell stability,
user privacy, or review readiness MUST be rejected.

Amendments require an explicit update to this file with rationale in the Sync
Impact Report. Versioning follows semantic versioning: MAJOR for incompatible
principle or governance changes, MINOR for new or materially expanded principles
or sections, and PATCH for clarifications that do not change obligations. When
principles conflict, decisions MUST prioritize GNOME Shell stability first, user
privacy second, correctness of usage display third, and visual polish fourth.

**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30
