# Tasks: Top-bar Codex Balance Usage Indicator

**Input**: Design documents from `/specs/001-codex-balance-indicator/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/balance-source.md`, `contracts/ui-state.md`, `quickstart.md`

**Tests**: Required by the feature specification and plan. Include non-Shell GJS tests for normalization, parsing, status mapping, stale handling, auth-mode rejection, formatting, and redaction. Include manual GNOME Shell verification for lifecycle, UI, source failure, and release packaging behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or only depends on completed foundation work
- **[Story]**: User story label for traceability, only used in user story phases
- Every task includes exact repository-relative file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the root extension structure, schema location, and test harness entry points described in the implementation plan.

- [ ] T001 Create root extension skeleton files in `extension.js`, `metadata.json`, `prefs.js`, and `stylesheet.css`
- [ ] T002 Create runtime module skeleton files in `lib/balanceSource.js`, `lib/codexAppServerSource.js`, `lib/mockSource.js`, `lib/model.js`, `lib/formatter.js`, `lib/redaction.js`, `lib/settings.js`, and `lib/compatibility.js`
- [ ] T003 [P] Create GSettings schema skeleton in `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`
- [ ] T004 [P] Create non-Shell test harness entry point in `tests/run-tests.sh`
- [ ] T005 [P] Create initial fixture directory and fixture README in `tests/fixtures/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared data contracts, settings, lifecycle ownership, redaction, and pure helper modules that every user story depends on.

**Critical**: No user story implementation should begin until this phase is complete.

- [ ] T006 Define extension metadata, UUID, supported GNOME Shell versions 46, 47, 48, and 49, and stylesheet/schema references in `metadata.json`
- [ ] T007 Define preferences keys, defaults, ranges, and enum values in `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`
- [ ] T008 [P] Implement `CodexBalanceSnapshot`, `BalanceBucket`, `SourceAuthContext`, `DataSourceConfig`, and `RefreshState` validation helpers in `lib/model.js`
- [ ] T009 [P] Implement the `BalanceSource` interface contract and shared provider error types in `lib/balanceSource.js`
- [ ] T010 [P] Implement centralized sensitive-value redaction helpers in `lib/redaction.js`
- [ ] T011 [P] Implement status, percent, bucket-priority, and local-time formatting helpers in `lib/formatter.js`
- [ ] T012 [P] Implement settings load, validation, and fallback helpers in `lib/settings.js`
- [ ] T013 [P] Implement GNOME Shell 46-49 compatibility helper functions in `lib/compatibility.js`
- [ ] T014 Implement enable/disable lifecycle scaffolding with no UI, timers, settings bindings, source work, or external access before `enable()` in `extension.js`
- [ ] T015 [P] Implement preferences UI scaffolding for refresh interval, warning threshold, display format, bucket priority, source kind, and Codex command path in `prefs.js`

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Glance at Current Balance (Priority: P1) - MVP

**Goal**: Show exactly one compact top-bar indicator whose label and state summarize the most constrained available Codex Balance bucket.

**Independent Test**: Enable the extension with representative mock Balance data and verify exactly one top-bar item appears with a compact state for loading, normal, warning, limit reached, stale, and unavailable/error-safe states.

### Tests for User Story 1

- [ ] T016 [P] [US1] Add formatter tests for lowest-bucket display text, warning threshold, limit reached, and display format variants in `tests/formatter.test.js`
- [ ] T017 [P] [US1] Add snapshot/status mapping tests for normal, warning, limit reached, loading, partial bucket, and stale-safe panel states in `tests/balanceSource.test.js`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement deterministic mock snapshots for loading, normal, warning, limit reached, stale, unavailable, and error states in `lib/mockSource.js`
- [ ] T019 [US1] Implement compact panel display text derivation for `bucket-percent`, `percent-only`, and `state-label` formats in `lib/formatter.js`
- [ ] T020 [US1] Wire extension controller state to settings and the selected source without starting duplicate providers in `extension.js`
- [ ] T021 [US1] Render exactly one owned top-bar indicator with compact label and status style classes in `extension.js`
- [ ] T022 [US1] Add panel indicator style classes for loading, normal, warning, limit reached, stale, not-authenticated, not-configured, and error states in `stylesheet.css`
- [ ] T023 [US1] Record manual enable/display verification steps and expected outcomes for the compact indicator in `specs/001-codex-balance-indicator/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and testable with mock data.

---

## Phase 4: User Story 2 - Inspect Detailed Balance Buckets (Priority: P1)

**Goal**: Show the 5-hour and weekly Balance buckets, reset information, freshness, current state, manual refresh action, and safe messages in the dropdown menu.

**Independent Test**: Open the indicator menu after a successful mock refresh and verify both bucket rows, reset time/text, last successful refresh, current state, and partial-bucket handling are visible.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add formatter tests for 5-hour and weekly bucket row labels, local timezone reset formatting, reset-text fallback, and unavailable bucket text in `tests/formatter.test.js`
- [ ] T025 [P] [US2] Add menu state fixture data for successful, partial-bucket, stale, and error snapshots in `tests/fixtures/menu-states.json`

### Implementation for User Story 2

- [ ] T026 [US2] Build dropdown menu rows for `fiveHour` and `weekly` bucket labels, percentages, reset values, and bucket statuses in `extension.js`
- [ ] T027 [US2] Render last successful refresh time, current overall data state, sanitized message row, and manual refresh action in `extension.js`
- [ ] T028 [US2] Implement bucket reset-time and fallback reset-text formatting for menu rows in `lib/formatter.js`
- [ ] T029 [US2] Add dropdown row, status, and action styles in `stylesheet.css`
- [ ] T030 [US2] Preserve visible valid bucket rows when the other bucket is unavailable or errored in `extension.js`

**Checkpoint**: User Stories 1 and 2 provide the full mock-backed panel and menu experience.

---

## Phase 5: User Story 3 - Refresh Without Disrupting the Desktop (Priority: P2)

**Goal**: Refresh automatically and manually through the real Codex app-server source without blocking GNOME Shell, overlapping refresh work, or losing prior good data after failures.

**Independent Test**: Trigger manual and automatic refreshes against successful, slow, failed, malformed, unauthenticated, API-key-authenticated, and rate-limited source states while the UI remains responsive and previous good data is preserved when appropriate.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add Codex app-server success, partial-window, malformed, API-key-auth, unauthenticated, timeout, and rate-limited fixtures in `tests/fixtures/codex-app-server.json`
- [ ] T032 [P] [US3] Add Codex app-server parsing tests for `rateLimitsByLimitId.codex`, `limitId: "codex"` fallback, 300-minute primary mapping, 10080-minute secondary mapping, and `100 - usedPercent` normalization in `tests/balanceSource.test.js`
- [ ] T033 [P] [US3] Add stale-after, no-overlap, cancellation, timeout, and failed-with-previous refresh tests in `tests/balanceSource.test.js`

### Implementation for User Story 3

- [ ] T034 [US3] Implement async `codex app-server --listen stdio://` subprocess setup, JSON-RPC initialize, and `account/rateLimits/read` request flow in `lib/codexAppServerSource.js`
- [ ] T035 [US3] Implement ChatGPT auth-mode preflight and explicit API-key auth rejection without reading or falling back to `OPENAI_API_KEY` in `lib/codexAppServerSource.js`
- [ ] T036 [US3] Normalize Codex app-server primary and secondary windows into `fiveHour` and `weekly` buckets in `lib/codexAppServerSource.js`
- [ ] T037 [US3] Implement provider timeout, cancellable cleanup, subprocess termination, and no-overlap refresh guarding in `lib/codexAppServerSource.js`
- [ ] T038 [US3] Implement automatic refresh timer, manual refresh action binding, stale-after calculation, and failed-refresh preservation of the last successful snapshot in `extension.js`
- [ ] T039 [US3] Connect refresh interval, timeout, selected source, and Codex command settings into provider creation and refresh options in `lib/settings.js` and `extension.js`
- [ ] T040 [US3] Record manual refresh, slow-source, failed-source, no-overlap, and stale-data verification results in `specs/001-codex-balance-indicator/quickstart.md`

**Checkpoint**: Real-source refresh behavior is implemented behind the replaceable source interface.

---

## Phase 6: User Story 4 - Understand Source and Configuration Problems (Priority: P2)

**Goal**: Show distinct, actionable, sanitized states for unauthenticated, not-configured, wrong-auth-mode, malformed, stale, rate-limited, timeout, and generic error conditions.

**Independent Test**: Use representative provider failures and verify the panel/menu state is distinct, non-crashing, and contains no credentials, cookies, tokens, account identifiers, authorization headers, or raw payload fragments.

### Tests for User Story 4

- [ ] T041 [P] [US4] Expand redaction tests for authorization headers, cookies, bearer tokens, token-like key/value pairs, account identifiers, high-entropy strings, and raw payload fragments in `tests/redaction.test.js`
- [ ] T042 [P] [US4] Add source failure mapping tests for not-authenticated, not-configured, wrong-auth-mode, malformed, rate-limited, timeout, and generic error snapshots in `tests/balanceSource.test.js`

### Implementation for User Story 4

- [ ] T043 [US4] Route provider stdout, stderr, JSON-RPC errors, and thrown errors through redaction before UI or logging in `lib/codexAppServerSource.js` and `lib/redaction.js`
- [ ] T044 [US4] Map provider failure kinds to normalized overall statuses, bucket statuses, and sanitized detail messages in `lib/model.js` and `lib/formatter.js`
- [ ] T045 [US4] Display sanitized authentication, configuration, stale, and error states in the panel and dropdown without raw provider payloads in `extension.js`
- [ ] T046 [US4] Reject invalid preferences and fall back safely for source kind, Codex command, refresh interval, timeout, warning threshold, display format, and bucket priority in `lib/settings.js` and `prefs.js`
- [ ] T047 [US4] Add stale, not-authenticated, not-configured, rate-limited, timeout, and error visual treatments in `stylesheet.css`
- [ ] T048 [US4] Record sensitive-error redaction and source-problem manual verification results in `specs/001-codex-balance-indicator/quickstart.md`

**Checkpoint**: Source and configuration failures are clear, safe, and test-covered.

---

## Phase 7: User Story 5 - Clean Lifecycle and First-Release Verification (Priority: P3)

**Goal**: Ensure enable, disable, reload, update, and package review do not leave duplicate UI, stale timers, lingering refreshes, or unnecessary files.

**Independent Test**: Repeatedly enable, disable, and reload the extension while checking for duplicate panel items, duplicate timers, lingering subprocesses, stale source work, package contents, and GNOME Shell 46-49 compatibility.

### Tests for User Story 5

- [ ] T049 [US5] Record 10-cycle enable/disable, shell reload, and suspend/resume manual verification evidence in `specs/001-codex-balance-indicator/quickstart.md`

### Implementation for User Story 5

- [ ] T050 [US5] Audit and complete cleanup of panel item, menu rows, timers, settings bindings, cancellables, source instances, and signal handlers in `extension.js`
- [ ] T051 [US5] Apply GNOME Shell 46-49 compatibility helper usage for panel, menu, settings, and preferences APIs in `lib/compatibility.js`, `extension.js`, and `prefs.js`
- [ ] T052 [P] [US5] Document package contents, local install, schema compilation, enable/disable, and real-source setup in `README.md`
- [ ] T053 [US5] Verify package scope excludes credentials, tokens, raw captured payloads, generated test artifacts, and unrelated project files in `metadata.json` and `README.md`

**Checkpoint**: Lifecycle and first-release gate are ready for release review.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across documentation, tests, UI polish, privacy, and packaging.

- [ ] T054 [P] Update user-facing installation, preferences, test, source setup, and privacy documentation in `README.md`
- [ ] T055 [P] Run the full non-Shell test suite via `tests/run-tests.sh` and document the command or prerequisites in `README.md`
- [ ] T056 [P] Run the manual GNOME Shell release checklist and record final status in `specs/001-codex-balance-indicator/quickstart.md`
- [ ] T057 [P] Review panel/menu text length, state styling, and absence of continuous animation in `extension.js` and `stylesheet.css`
- [ ] T058 Perform final privacy and package review for runtime files only in `metadata.json`, `lib/redaction.js`, `lib/codexAppServerSource.js`, and `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational; can run in parallel with US1 after shared helpers exist, but integrates naturally after US1 panel state.
- **User Story 3 (Phase 5)**: Depends on Foundational; can begin after the source interface and settings helpers exist.
- **User Story 4 (Phase 6)**: Depends on Foundational; can begin after provider error types and redaction helpers exist, and integrates with US3 provider behavior.
- **User Story 5 (Phase 7)**: Depends on Foundational; final release checks depend on selected implemented stories.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Glance at Current Balance (P1)**: No dependency on other user stories; uses mock source and shared formatting/model foundation.
- **US2 Inspect Detailed Balance Buckets (P1)**: Independent after foundation, but benefits from US1 controller state and formatter behavior.
- **US3 Refresh Without Disrupting the Desktop (P2)**: Independent after foundation; provides real-source refresh behavior required for release completion.
- **US4 Understand Source and Configuration Problems (P2)**: Independent after foundation; integrates with US3 provider failures and shared redaction.
- **US5 Clean Lifecycle and First-Release Verification (P3)**: Can be worked after foundation, with final validation after US1-US4 are implemented.

### Within Each User Story

- Write or update non-Shell tests before implementation when a task changes parsing, formatting, status mapping, stale handling, auth rejection, or redaction behavior.
- Implement pure helpers before Shell UI integration.
- Implement lifecycle ownership and cleanup before adding timers or subprocess work.
- Verify each story independently before moving to the next priority scope.

---

## Parallel Opportunities

- Setup tasks T003, T004, and T005 can run in parallel after T001-T002 are understood.
- Foundational tasks T008 through T013 and T015 can run in parallel because they target separate modules.
- US1 tests T016 and T017 can run in parallel, and T018 can run alongside formatter implementation planning.
- US2 fixture and formatter test tasks T024 and T025 can run in parallel.
- US3 fixture, parser, and refresh-state test tasks T031 through T033 can run in parallel.
- US4 redaction and source-failure tests T041 and T042 can run in parallel.
- US5 documentation task T052 can run in parallel with lifecycle cleanup task T050.
- Polish tasks T054 through T057 can run in parallel once the relevant implementation is complete.

---

## Parallel Example: User Story 1

```text
Task: T016 [P] [US1] Add formatter tests for lowest-bucket display text, warning threshold, limit reached, and display format variants in tests/formatter.test.js
Task: T017 [P] [US1] Add snapshot/status mapping tests for normal, warning, limit reached, loading, partial bucket, and stale-safe panel states in tests/balanceSource.test.js
Task: T018 [P] [US1] Implement deterministic mock snapshots for loading, normal, warning, limit reached, stale, unavailable, and error states in lib/mockSource.js
```

## Parallel Example: User Story 2

```text
Task: T024 [P] [US2] Add formatter tests for 5-hour and weekly bucket row labels, local timezone reset formatting, reset-text fallback, and unavailable bucket text in tests/formatter.test.js
Task: T025 [P] [US2] Add menu state fixture data for successful, partial-bucket, stale, and error snapshots in tests/fixtures/menu-states.json
```

## Parallel Example: User Story 3

```text
Task: T031 [P] [US3] Add Codex app-server success, partial-window, malformed, API-key-auth, unauthenticated, timeout, and rate-limited fixtures in tests/fixtures/codex-app-server.json
Task: T032 [P] [US3] Add Codex app-server parsing tests for rateLimitsByLimitId.codex, limitId fallback, window mapping, and percent normalization in tests/balanceSource.test.js
Task: T033 [P] [US3] Add stale-after, no-overlap, cancellation, timeout, and failed-with-previous refresh tests in tests/balanceSource.test.js
```

## Parallel Example: User Story 4

```text
Task: T041 [P] [US4] Expand redaction tests for sensitive values in tests/redaction.test.js
Task: T042 [P] [US4] Add source failure mapping tests in tests/balanceSource.test.js
```

## Parallel Example: User Story 5

```text
Task: T050 [US5] Audit and complete cleanup in extension.js
Task: T052 [P] [US5] Document package contents and local install flow in README.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational tasks.
3. Complete Phase 3 User Story 1 with mock source data.
4. Stop and validate exactly one top-bar indicator with compact loading, normal, warning, limit reached, stale, and error-safe states.

### Incremental Delivery

1. Deliver US1 for the compact top-bar indicator.
2. Deliver US2 for the detailed dropdown menu.
3. Deliver US3 for real Codex app-server refresh, automatic/manual polling, timeout, cancellation, and stale handling.
4. Deliver US4 for source/configuration problem clarity and redaction coverage.
5. Deliver US5 for lifecycle cleanup, compatibility, packaging, and release-gate verification.

### Release Gate

1. Confirm the real source uses `codex app-server --listen stdio://` and JSON-RPC `account/rateLimits/read`.
2. Confirm ChatGPT auth succeeds and API-key auth is rejected.
3. Confirm 300-minute and 10080-minute windows map to 5-hour and weekly buckets.
4. Confirm no credentials, tokens, account identifiers, authorization headers, raw payloads, or unrelated artifacts are logged, displayed, committed, stored, or packaged.
5. Confirm manual checks pass on GNOME Shell 46, 47, 48, and 49.
