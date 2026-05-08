# Tasks: Reset Time Countdown

**Input**: Design documents from `/specs/004-reset-time-countdown/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/

**Tests**: Formatter behavior is required for this feature. Add deterministic non-Shell GJS coverage before changing reset formatting, then run `tests/run-tests.sh`. Manual GNOME Shell verification is required for menu repaint, failure states, refresh pause, and lifecycle cleanup.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Each task includes an exact repository file path or command path

## Phase 1: Setup (Shared Baseline)

**Purpose**: Confirm the existing extension and test baseline before changing presentation behavior.

- [ ] T001 Run the existing non-Shell test suite with `tests/run-tests.sh`
- [ ] T002 [P] Review current reset data normalization in `lib/model.js` and confirm `resetAtUnix` remains the authoritative timestamp input
- [ ] T003 [P] Review current menu bucket rendering in `extension.js` and identify the `_addBucketRow()` and `_rebuildMenu()` touch points for reset label display
- [ ] T004 [P] Review existing formatter assertions in `tests/formatter.test.js` and note current absolute reset output expectations to replace

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared formatting entry points and implementation boundaries required by all user stories.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Update `lib/formatter.js` function signatures so `formatReset(bucket, options = {})` and `formatBucketRow(bucket, options = {})` accept optional `nowUnix` without changing unrelated formatter behavior
- [ ] T006 Update existing calls and assertions in `tests/formatter.test.js` to pass deterministic `nowUnix` where reset text is asserted
- [ ] T007 Confirm `formatLastRefresh()` in `lib/formatter.js` still uses absolute local date/time formatting and is not routed through countdown logic
- [ ] T008 Confirm no storage, provider, schema, or preferences changes are needed by leaving `lib/codexAppServerSource.js`, `lib/balanceSource.js`, `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`, and `prefs.js` behavior unchanged

**Checkpoint**: Formatter entry points accept deterministic time input, and reset presentation can change without touching acquisition, storage, settings, or preferences.

---

## Phase 3: User Story 1 - Understand Near Reset Timing (Priority: P1) MVP

**Goal**: Show each available 5-hour or weekly reset timestamp as a relative countdown instead of an absolute date/time string.

**Independent Test**: With a known future reset timestamp, `formatReset()` and `formatBucketRow()` return relative text such as `Resets in 1 minute` and `Resets in 2h 15m`, and the menu bucket row displays that string.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add failing formatter assertions for exactly 1 minute and 2h 15m countdowns in `tests/formatter.test.js`
- [ ] T010 [P] [US1] Add a failing `formatBucketRow(bucket, {nowUnix})` assertion that row reset text is relative in `tests/formatter.test.js`

### Implementation for User Story 1

- [ ] T011 [US1] Implement future reset countdown formatting in `formatReset()` in `lib/formatter.js` using `options.nowUnix` or current Unix time
- [ ] T012 [US1] Thread formatter options from `formatBucketRow()` to `formatReset()` in `lib/formatter.js`
- [ ] T013 [US1] Update `_addBucketRow()` in `extension.js` to call `formatBucketRow(bucket, {nowUnix: Math.floor(Date.now() / 1000)})`
- [ ] T014 [US1] Run `tests/run-tests.sh` and verify the User Story 1 formatter assertions pass

**Checkpoint**: User Story 1 is functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Compare Multiple Limit Resets (Priority: P2)

**Goal**: Ensure both visible 5-hour and weekly rows use the same relative reset style so users can compare reset timing quickly.

**Independent Test**: With both bucket resets available, `formatBucketRow()` produces relative reset text for both buckets and the menu renders both rows using the same style.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add formatter assertions for both 5-hour and weekly bucket rows using relative reset output in `tests/formatter.test.js`
- [ ] T016 [P] [US2] Add a regression assertion that fallback `resetText` still produces `Resets {resetText}` when `resetAtUnix` is unavailable in `tests/formatter.test.js`

### Implementation for User Story 2

- [ ] T017 [US2] Verify `_rebuildMenu()` in `extension.js` sends both `snapshot.fiveHour` and `snapshot.weekly` through the updated `_addBucketRow()` relative formatting path
- [ ] T018 [US2] Remove or update any remaining absolute reset text expectation for bucket rows in `tests/formatter.test.js`
- [ ] T019 [US2] Run `tests/run-tests.sh` and verify both-bucket and fallback reset assertions pass

**Checkpoint**: User Stories 1 and 2 both work independently, and fallback reset behavior is preserved.

---

## Phase 5: User Story 3 - Handle Boundary Reset Values (Priority: P3)

**Goal**: Keep reset text clear and non-negative for imminent, exact-boundary, whole-hour, long-duration, due, elapsed, missing, and stale reset timestamps.

**Independent Test**: Deterministic formatter cases cover all boundary values, and an open menu refreshes countdown labels at minute granularity without fetching new usage data.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add formatter assertions for less than 1 minute, exactly 1 hour, whole hours, more than 24 hours, due now, and elapsed reset timestamps in `tests/formatter.test.js`
- [ ] T021 [P] [US3] Add formatter assertions for missing bucket, missing reset timestamp, unavailable reset data, and stale bucket reset data in `tests/formatter.test.js`

### Implementation for User Story 3

- [ ] T022 [US3] Extend `formatReset()` in `lib/formatter.js` to return `Resets in less than 1 minute`, `Resets in {hours}h`, total-hour compact text, and `Reset due` for the required boundary cases
- [ ] T023 [US3] Add countdown repaint state fields `_countdownRefreshTimerId` and `_menuOpenSignalId` during `enable()` initialization in `extension.js`
- [ ] T024 [US3] Connect the indicator menu open-state signal after `this._indicator` is created in `extension.js` and start countdown repaint work only when the menu is open
- [ ] T025 [US3] Implement a minute-level GLib timeout helper in `extension.js` that re-renders the effective snapshot from memory without calling `_refresh()`, provider code, storage, settings, or credential paths
- [ ] T026 [US3] Stop and clear the countdown repaint timeout when the menu closes in `extension.js`
- [ ] T027 [US3] Disconnect the menu signal and remove the countdown repaint timeout during `disable()` cleanup in `extension.js`
- [ ] T028 [US3] Run `tests/run-tests.sh` and verify all boundary formatter assertions pass

**Checkpoint**: All user stories are independently functional, and countdown UI lifecycle ownership is explicit.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across automated tests, GNOME Shell behavior, lifecycle cleanup, and project documentation.

- [ ] T029 [P] Execute the automated checks documented in `specs/004-reset-time-countdown/quickstart.md` using `tests/run-tests.sh`
- [ ] T030 Manually verify mock-source countdown behavior, both bucket rows, minute-boundary repaint, and refresh pause behavior using `specs/004-reset-time-countdown/quickstart.md`
- [ ] T031 Manually verify live-provider countdown behavior and unchanged `Freshness` absolute date/time display using `specs/004-reset-time-countdown/quickstart.md`
- [ ] T032 Manually verify missing config, wrong auth mode, malformed reset data, stale data, manual refresh, automatic refresh, menu close, and repeated enable/disable cleanup using `specs/004-reset-time-countdown/quickstart.md`
- [ ] T033 [P] Review privacy and data-acquisition scope in `lib/formatter.js`, `extension.js`, `lib/codexAppServerSource.js`, and `lib/balanceSource.js` to confirm no new data collection, storage, telemetry, subprocess, file read, or network behavior was introduced
- [ ] T034 [P] Update user-facing documentation only if existing reset display examples are now stale in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2; recommended MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and integrates naturally after US1 formatter behavior exists.
- **User Story 3 (Phase 5)**: Depends on Phase 2 and should follow US1/US2 to extend boundary and lifecycle behavior.
- **Polish (Phase 6)**: Depends on the user stories selected for delivery.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after Foundation.
- **US2 (P2)**: Can be tested independently with both bucket rows, but expects the relative formatter path introduced by US1.
- **US3 (P3)**: Extends the shared formatter and menu lifecycle behavior after the base relative display exists.

### Within Each User Story

- Add failing deterministic formatter tests before implementation.
- Implement formatter behavior before menu rendering changes.
- Implement lifecycle cleanup before relying on any open-menu timeout.
- Run `tests/run-tests.sh` before moving to the next story checkpoint.

## Parallel Opportunities

- Setup review tasks T002, T003, and T004 can run in parallel.
- US1 test tasks T009 and T010 can run in parallel.
- US2 test tasks T015 and T016 can run in parallel.
- US3 test tasks T020 and T021 can run in parallel.
- Polish tasks T029, T033, and T034 can run in parallel with manual verification preparation once implementation is complete.

## Parallel Example: User Story 1

```bash
Task: "T009 [P] [US1] Add failing formatter assertions for exactly 1 minute and 2h 15m countdowns in tests/formatter.test.js"
Task: "T010 [P] [US1] Add a failing formatBucketRow(bucket, {nowUnix}) assertion that row reset text is relative in tests/formatter.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "T015 [P] [US2] Add formatter assertions for both 5-hour and weekly bucket rows using relative reset output in tests/formatter.test.js"
Task: "T016 [P] [US2] Add a regression assertion that fallback resetText still produces Resets {resetText} when resetAtUnix is unavailable in tests/formatter.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T020 [P] [US3] Add formatter assertions for less than 1 minute, exactly 1 hour, whole hours, more than 24 hours, due now, and elapsed reset timestamps in tests/formatter.test.js"
Task: "T021 [P] [US3] Add formatter assertions for missing bucket, missing reset timestamp, unavailable reset data, and stale bucket reset data in tests/formatter.test.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate with `tests/run-tests.sh` plus a quick mock-source menu check.

### Incremental Delivery

1. Deliver US1 to replace absolute reset date/time strings with relative countdowns.
2. Deliver US2 to confirm both tracked limit rows consistently use the same style while fallback behavior remains intact.
3. Deliver US3 to harden boundary values and open-menu minute repaint lifecycle.
4. Complete Phase 6 before release or PR review.

### Parallel Team Strategy

1. One developer handles formatter tests in `tests/formatter.test.js`.
2. One developer handles formatter implementation in `lib/formatter.js`.
3. One developer handles open-menu repaint lifecycle in `extension.js` after the formatter contract is stable.

## Notes

- `[P]` tasks use different files or are independent checks with no dependency on incomplete implementation tasks.
- `[US1]`, `[US2]`, and `[US3]` map directly to the user stories in `specs/004-reset-time-countdown/spec.md`.
- Keep acquisition modules, schema, preferences, authentication, storage, telemetry behavior, and top-bar display selection unchanged unless a narrow integration issue is discovered.
