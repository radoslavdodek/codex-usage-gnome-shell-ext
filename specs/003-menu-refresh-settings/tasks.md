# Tasks: Menu Refresh Settings

**Input**: Design documents from `/home/rado/Work/personal-projects/codex-usage-gnome-shell-ext/specs/003-menu-refresh-settings/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: Required by the feature specification. Use focused non-Shell GJS settings tests plus live GNOME Shell menu, pause, timer, and lifecycle verification.
**Organization**: Tasks are grouped by user story so each story can be implemented, verified, and reviewed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file or isolated manual verification environment
- **[Story]**: Maps task to a user story from `spec.md`
- Every task includes the exact file path or artifact path it changes or records

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish current implementation surfaces and verification artifacts before changing runtime behavior.

- [X] T001 Inspect current refresh settings, menu, preferences, schema, and test surfaces in `extension.js`, `lib/settings.js`, `prefs.js`, `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`, and `tests/run-tests.sh` against `specs/003-menu-refresh-settings/contracts/menu-refresh-settings.md` and `specs/003-menu-refresh-settings/contracts/settings-schema.md`
- [X] T002 [P] Create the manual verification record scaffold in `specs/003-menu-refresh-settings/verification-record.md` with sections for automated checks, User Story 1 interval checks, User Story 2 pause checks, User Story 3 state-reachability checks, and final lifecycle validation
- [X] T003 [P] Create sanitized evidence guidance in `specs/003-menu-refresh-settings/evidence/README.md` describing how to record GNOME Shell observations without credentials, tokens, account identifiers, or raw provider payloads

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the persistent refresh settings contract and reusable normalization/test infrastructure needed by every user story.

**Critical**: No user story implementation can begin until the schema, settings normalization, and shared test runner are ready.

- [X] T004 Update `tests/run-tests.sh` to discover and run every `tests/*.test.js` GJS module after compiling `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`
- [X] T005 [P] Add failing shared settings tests in `tests/settings.test.js` for default `refreshIntervalSeconds` 300, valid intervals 60/300/1800, out-of-range values 59/1801, whole-minute conversion helpers, `refreshPaused` default false, `configFromSettings()`, and `connectSettings()`
- [X] T006 Update `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml` so `refresh-interval-seconds` has range 60 through 1800 with default 300 and add boolean key `refresh-paused` with default false
- [X] T007 Update `lib/settings.js` to set `DEFAULT_CONFIG.refreshIntervalSeconds` to 300, normalize refresh intervals to 60 through 1800 seconds, expose whole-minute conversion helpers, include `refreshPaused` in `DEFAULT_CONFIG`, `normalizeConfig()`, `configFromSettings()`, and `connectSettings()`
- [X] T008 Update `prefs.js` refresh settings helper structure so the refresh group can bind second-backed minute controls and boolean switch controls from `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`
- [X] T009 Update `extension.js` settings-change flow to compare old and new refresh settings explicitly while recreating the usage source only when `source-kind` or `mock-scenario` changes
- [X] T010 Run `tests/run-tests.sh` and record the foundational automated result in `specs/003-menu-refresh-settings/verification-record.md`

**Checkpoint**: Settings schema, normalization, preferences plumbing, and tests are ready for user story work.

---

## Phase 3: User Story 1 - Change Refresh Interval From Menu (Priority: P1) MVP

**Goal**: The indicator menu shows the current refresh interval in whole minutes and lets the user choose any value from 1 through 30 minutes, with changes persisting and rescheduling automatic refreshes immediately.

**Independent Test**: Open the indicator menu, set intervals to 1, 5, and 30 minutes, reopen the menu and re-enable the extension, then verify the selected value remains visible and automatic refresh scheduling uses that interval without duplicate timers.

### Tests for User Story 1

- [X] T011 [P] [US1] Add User Story 1 interval verification rows to `specs/003-menu-refresh-settings/verification-record.md` for menu visibility, values 1/5/30, direct out-of-range settings writes, persistence across menu reopen, and timer rescheduling
- [X] T012 [P] [US1] Extend `tests/settings.test.js` with interval-specific assertions for user-facing minute labels/values 1/5/30 and defensive normalization of direct numeric values outside 60 through 1800 seconds

### Implementation for User Story 1

- [X] T013 [US1] Add a menu-owned refresh interval section in `extension.js` using existing `PopupMenu` and St patterns to display the current interval in whole minutes
- [X] T014 [US1] Wire interval menu activations in `extension.js` to write selected values 1 through 30 as seconds to the `refresh-interval-seconds` GSettings key
- [X] T015 [US1] Update `_scheduleRefreshTimer()` in `extension.js` to use normalized `this._config.refreshIntervalSeconds`, remove any old GLib source before adding a new one, and keep at most one automatic refresh timer after interval changes
- [X] T016 [P] [US1] Update the refresh interval preferences UI in `prefs.js` to display and edit whole minutes 1 through 30 while storing seconds in `refresh-interval-seconds`
- [X] T017 [US1] Run `tests/run-tests.sh` and record the User Story 1 automated result in `specs/003-menu-refresh-settings/verification-record.md`
- [ ] T018 [US1] Install and enable the extension with the commands in `specs/003-menu-refresh-settings/quickstart.md`, change the interval to 1, 5, and 30 minutes from the menu, reopen/re-enable the extension, and record User Story 1 manual results in `specs/003-menu-refresh-settings/verification-record.md`

**Checkpoint**: User Story 1 is complete when interval controls work from the menu, values persist, and automatic refreshes reschedule without duplicate timers.

---

## Phase 4: User Story 2 - Pause Usage Refreshes (Priority: P1)

**Goal**: The indicator menu exposes refresh pause, the paused state persists, the panel caption reads exactly `Paused`, and no automatic or manual usage refresh starts while pause is active.

**Independent Test**: Enable refresh pause from the menu, wait through at least one configured interval, attempt manual refresh, and verify no refresh starts while the top-bar caption remains exactly `Paused`; then disable pause and verify refresh behavior resumes.

### Tests for User Story 2

- [X] T019 [P] [US2] Add failing pause helper tests in `tests/refreshPause.test.js` covering a pure refresh-start guard that allows refresh when `refreshPaused` is false and suppresses refresh when `refreshPaused` is true
- [X] T020 [P] [US2] Add User Story 2 pause verification rows to `specs/003-menu-refresh-settings/verification-record.md` for pause switch visibility, exact `Paused` caption, automatic refresh suppression, manual refresh suppression, in-progress refresh suppression, unpause resume, and persistence

### Implementation for User Story 2

- [X] T021 [US2] Export the pure refresh-start guard from `lib/settings.js` and use it in `extension.js` to block manual and automatic refresh starts when `this._config.refreshPaused` is true
- [X] T022 [US2] Add a refresh pause switch/control to the menu refresh section in `extension.js` that reflects and writes the `refresh-paused` GSettings key
- [X] T023 [US2] Update `_render()` or a dedicated render helper in `extension.js` so `refreshPaused` takes precedence over all snapshots and sets the panel caption to exactly `Paused`
- [X] T024 [US2] Update `_scheduleRefreshTimer()` in `extension.js` to remove any existing GLib source and avoid arming a new timer while `this._config.refreshPaused` is true, then resume scheduling when pause is false
- [X] T025 [US2] Update `_onSettingsChanged()` and `_refresh().finally()` in `extension.js` so enabling pause during an in-progress refresh cancels or suppresses the visible refreshing state and leaves the panel on `Paused`
- [X] T026 [P] [US2] Add a `Refresh Pause` switch row to the refresh preferences group in `prefs.js` bound to `refresh-paused`
- [X] T027 [US2] Run `tests/run-tests.sh` and record the User Story 2 automated result in `specs/003-menu-refresh-settings/verification-record.md`
- [ ] T028 [US2] Install and enable the extension with `specs/003-menu-refresh-settings/quickstart.md`, verify pause through at least one interval plus a manual refresh attempt, unpause, and record User Story 2 manual results in `specs/003-menu-refresh-settings/verification-record.md`

**Checkpoint**: User Story 2 is complete when pause persists, visibly overrides the panel caption, suppresses all refresh starts, and normal refresh behavior resumes after unpause.

---

## Phase 5: User Story 3 - Reach Settings In Any Usage State (Priority: P2)

**Goal**: Refresh interval and pause controls remain reachable from the menu while usage data is loading, valid, stale, unavailable, rate-limited, malformed, unauthenticated, not configured, generic error, or paused.

**Independent Test**: Put the extension into each supported mock or failure state, open the indicator menu, and verify refresh interval and pause controls remain visible and current while existing usage details stay sanitized.

### Tests for User Story 3

- [X] T029 [P] [US3] Add User Story 3 state-reachability matrix rows to `specs/003-menu-refresh-settings/verification-record.md` for loading, normal, stale, unavailable, rate-limited, malformed/error, not-authenticated, not-configured, and paused states

### Implementation for User Story 3

- [X] T030 [US3] Refactor `_rebuildMenu()` in `extension.js` so the no-snapshot/loading path no longer returns before adding the refresh settings section
- [X] T031 [US3] Add a reusable `_addRefreshSettingsMenuSection()` helper in `extension.js` and call it for loading, valid, stale, unauthenticated, not-configured, unavailable, error, rate-limited, malformed, and paused menu states
- [X] T032 [US3] Keep the manual refresh action visible in `extension.js` for snapshot and no-snapshot states, setting it insensitive while refreshing or paused and ensuring activation does not start work when paused
- [ ] T033 [US3] Use mock scenarios and direct settings from `prefs.js` or GSettings to exercise the state matrix in `specs/003-menu-refresh-settings/quickstart.md` and record User Story 3 manual results in `specs/003-menu-refresh-settings/verification-record.md`
- [ ] T034 [US3] Run at least 10 extension enable/disable cycles and record absence of duplicate indicators, menu rows, settings signals, timers, and provider refreshes in `specs/003-menu-refresh-settings/verification-record.md`

**Checkpoint**: User Story 3 is complete when refresh controls remain visible and current across all required usage states and lifecycle cycles.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, visual cleanup, package hygiene, privacy review, and release validation across all stories.

- [X] T035 [P] Update `README.md` to document menu-based refresh interval control, the 1 through 30 minute range, refresh pause semantics, and the exact `Paused` caption
- [X] T036 [P] Review and update `stylesheet.css` for stable refresh menu row spacing or state styling introduced by `extension.js`
- [X] T037 Update `specs/003-menu-refresh-settings/quickstart.md` if the final menu control wording, settings smoke commands, or manual verification steps differ from the implemented UI
- [X] T038 Run final `tests/run-tests.sh` and record the final automated result in `specs/003-menu-refresh-settings/verification-record.md`
- [X] T039 Build the runtime package with the `gnome-extensions pack` command from `specs/003-menu-refresh-settings/quickstart.md` and record package path plus schema inclusion in `specs/003-menu-refresh-settings/verification-record.md`
- [X] T040 Review `README.md`, `specs/003-menu-refresh-settings/verification-record.md`, and `specs/003-menu-refresh-settings/evidence/README.md` for credentials, tokens, account identifiers, telemetry claims, and raw provider payloads

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and can start immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user stories because the schema and settings contract must exist before menu controls write to GSettings.
- **Phase 3: User Story 1** depends on Phase 2 and can deliver the MVP interval control independently.
- **Phase 4: User Story 2** depends on Phase 2 and can be implemented independently from User Story 1 behavior, though both stories modify `extension.js` and require coordination if worked in parallel.
- **Phase 5: User Story 3** depends on User Stories 1 and 2 because it verifies both controls across every usage state.
- **Phase 6: Polish** depends on all selected user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2; no logical dependency on User Story 2.
- **User Story 2 (P1)**: Can start after Phase 2; no logical dependency on User Story 1.
- **User Story 3 (P2)**: Depends on User Stories 1 and 2 because state reachability requires both interval and pause controls to exist.

### Within Each User Story

- Add or update automated and manual verification rows before changing runtime behavior.
- Write failing non-Shell tests before implementing shared settings or pure pause helpers.
- Implement schema/settings changes before writing menu or preferences controls that bind to those keys.
- Complete each story's automated and manual verification before treating the story as done.

---

## Parallel Opportunities

- T002 and T003 can run in parallel after T001 because they write separate verification artifacts.
- T005 can run in parallel with T006 and T007 because it writes test expectations while schema/settings implementation catches up.
- T011 and T012 can run in parallel with early User Story 1 implementation because they write verification/test artifacts.
- T019 and T020 can run in parallel with early User Story 2 implementation because they write separate test and verification artifacts.
- User Stories 1 and 2 can be worked on in parallel after Phase 2 if developers coordinate `extension.js` edits carefully.
- T035 and T036 can run in parallel during polish because they touch separate documentation and style files.

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Add interval verification rows to specs/003-menu-refresh-settings/verification-record.md"
Task: "T012 [P] [US1] Extend tests/settings.test.js with interval-specific assertions"
Task: "T016 [P] [US1] Update prefs.js to display/edit whole minutes"
```

## Parallel Example: User Story 2

```text
Task: "T019 [P] [US2] Add tests/refreshPause.test.js for pause helper coverage"
Task: "T020 [P] [US2] Add pause verification rows to specs/003-menu-refresh-settings/verification-record.md"
Task: "T026 [P] [US2] Add the Refresh Pause preference switch in prefs.js"
```

## Parallel Example: User Story 3

```text
Task: "T029 [P] [US3] Add the state-reachability matrix to specs/003-menu-refresh-settings/verification-record.md"
Task: "T033 [US3] Exercise mock scenarios and record state reachability results"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 interval menu controls.
3. Stop and validate that interval values 1, 5, and 30 minutes are accepted, displayed, persisted, and used by the automatic refresh timer.

### Incremental Delivery

1. Finish Setup and Foundational tasks so the schema, settings normalization, preferences plumbing, and tests are ready.
2. Deliver User Story 1 for menu-based interval changes.
3. Deliver User Story 2 for persistent refresh pause and exact `Paused` caption.
4. Deliver User Story 3 for state-independent settings reachability and lifecycle regression checks.
5. Finish polish tasks for README, styles, quickstart alignment, package build, final tests, and privacy review.

### Release Gate

Do not treat this feature as release-ready until `tests/run-tests.sh` passes, `specs/003-menu-refresh-settings/verification-record.md` records successful or explicitly blocked manual checks for User Stories 1 through 3, and the package build includes `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml` with `refresh-paused`.
