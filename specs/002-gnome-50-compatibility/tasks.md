# Tasks: GNOME Shell 50.1 Compatibility

**Input**: Design documents from `/specs/002-gnome-50-compatibility/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: Required by the feature specification. Use existing non-Shell GJS tests plus live GNOME Shell compatibility and regression verification.
**Organization**: Tasks are grouped by user story so each story can be implemented, verified, and reviewed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file or isolated Shell environment
- **[Story]**: Maps task to a user story from `spec.md`
- Every task includes the exact file path or artifact path it changes or records

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the current compatibility surfaces and verification artifacts before changing release scope.

- [X] T001 Inspect current compatibility declarations in `metadata.json` and `README.md` against `specs/002-gnome-50-compatibility/contracts/compatibility-support.md`
- [X] T002 [P] Review the required version/check matrix in `specs/002-gnome-50-compatibility/contracts/verification-record.md`
- [X] T003 Create the release verification record scaffold in `specs/002-gnome-50-compatibility/verification-record.md`
- [X] T004 [P] Create sanitized evidence file guidance in `specs/002-gnome-50-compatibility/evidence/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the install compatibility gate and create package/test evidence required before live Shell verification.

**Critical**: No user story verification can begin until the runtime package reflects the updated metadata.

- [X] T005 Update `metadata.json` `shell-version` to `["46", "47", "48", "49", "50"]` without adding `50.1`, `50.2`, or `51`
- [X] T006 Validate `metadata.json` remains valid JSON with `uuid`, `name`, `description`, `settings-schema`, and `shell-version` matching `specs/002-gnome-50-compatibility/contracts/compatibility-support.md`
- [X] T007 Run `tests/run-tests.sh` and record the sanitized `non-shell-tests` result in `specs/002-gnome-50-compatibility/evidence/non-shell-tests.md`
- [X] T008 Build the runtime archive with the `gnome-extensions pack` command from `specs/002-gnome-50-compatibility/quickstart.md` and record the package path in `specs/002-gnome-50-compatibility/evidence/package-build.md`
- [X] T009 Inspect `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip` against the package contract and record `package-scope` in `specs/002-gnome-50-compatibility/evidence/package-scope.md`

**Checkpoint**: Metadata, non-Shell tests, and runtime package are ready for Shell version verification.

---

## Phase 3: User Story 1 - Use the Extension on GNOME Shell 50.1 (Priority: P1) MVP

**Goal**: GNOME Shell 50 and 50.1 can install, enable, display, refresh, fail safely, and clean up the extension with the existing user-visible behavior.

**Independent Test**: Install the packaged archive on GNOME Shell 50 and 50.1, enable it, verify exactly one indicator and all full compatibility checks, then disable/reload without duplicates or lingering activity.

### Tests for User Story 1

- [X] T010 [P] [US1] Run the full GNOME Shell 50 checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-50.md`
- [X] T011 [P] [US1] Run the full GNOME Shell 50.1 checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-50-1.md`

### Implementation for User Story 1

- [X] T012 [US1] If GNOME Shell 50 or 50.1 evidence shows an extension API failure, patch lifecycle or UI compatibility in `extension.js` and `lib/compatibility.js`, then rerun the failed checks recorded in `specs/002-gnome-50-compatibility/evidence/gnome-shell-50.md` or `specs/002-gnome-50-compatibility/evidence/gnome-shell-50-1.md`
- [X] T013 [US1] Merge GNOME Shell 50 and 50.1 pass/fail/blocked rows into `specs/002-gnome-50-compatibility/verification-record.md`

**Checkpoint**: User Story 1 is independently complete when GNOME Shell 50 and 50.1 rows are pass or explicitly blocked with a documented limitation.

---

## Phase 4: User Story 2 - Preserve Compatibility on Existing Supported Versions (Priority: P1)

**Goal**: GNOME Shell 46, 47, 48, and 49 continue to install, enable, display normal data, refresh manually, disable, and reload without user-visible regression.

**Independent Test**: Install the packaged archive on each existing supported Shell version and run the regression smoke checklist for that version.

### Tests for User Story 2

- [X] T014 [P] [US2] Run the GNOME Shell 46 regression smoke checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-46.md`
- [X] T015 [P] [US2] Run the GNOME Shell 47 regression smoke checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-47.md`
- [X] T016 [P] [US2] Run the GNOME Shell 48 regression smoke checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-48.md`
- [X] T017 [P] [US2] Run the GNOME Shell 49 regression smoke checklist from `specs/002-gnome-50-compatibility/quickstart.md` and write sanitized outcomes to `specs/002-gnome-50-compatibility/evidence/gnome-shell-49.md`

### Implementation for User Story 2

- [X] T018 [US2] If GNOME Shell 46 through 49 evidence shows a regression, patch only the impacted compatibility surface in `metadata.json`, `extension.js`, or `lib/compatibility.js`, then rerun and update `specs/002-gnome-50-compatibility/evidence/gnome-shell-46.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-47.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-48.md`, or `specs/002-gnome-50-compatibility/evidence/gnome-shell-49.md`
- [X] T019 [US2] Merge GNOME Shell 46, 47, 48, and 49 regression rows into `specs/002-gnome-50-compatibility/verification-record.md`

**Checkpoint**: User Story 2 is independently complete when all existing-version regression rows are pass or explicitly blocked with a documented limitation.

---

## Phase 5: User Story 3 - Confirm the Supported Version Range Before Release (Priority: P2)

**Goal**: Release-facing compatibility claims are explicit, reviewable, and bounded to GNOME Shell 50.1 as the highest verified point release for this feature.

**Independent Test**: Review `metadata.json`, `README.md`, package inspection evidence, and `verification-record.md` to confirm the declared support range is 46, 47, 48, 49, and 50 in metadata, with README/release evidence verified through 50.1 and no newer-version claim.

### Tests for User Story 3

- [X] T020 [US3] Review `metadata.json` and `README.md` for unsupported `50.2`, `51`, or newer-version claims and record `docs-version-bound` in `specs/002-gnome-50-compatibility/verification-record.md`
- [X] T021 [US3] Review `specs/002-gnome-50-compatibility/verification-record.md` for every required version/check row from `specs/002-gnome-50-compatibility/contracts/verification-record.md`

### Implementation for User Story 3

- [X] T022 [US3] Update the opening compatibility wording in `README.md` to state GNOME Shell 46, 47, 48, 49, and 50 support with verification through GNOME Shell 50.1
- [X] T023 [US3] Update the manual release checks in `README.md` to separate full GNOME Shell 50/50.1 checks from GNOME Shell 46 through 49 regression smoke checks
- [X] T024 [US3] Add the final release readiness summary with `highestVerifiedPointRelease: 50.1` to `specs/002-gnome-50-compatibility/verification-record.md`
- [X] T025 [US3] If any targeted version or check is blocked, document the unverified version, missing check, reason, and release limitation in `README.md` and `specs/002-gnome-50-compatibility/verification-record.md`

**Checkpoint**: User Story 3 is independently complete when docs and verification evidence agree on the supported range and the 50.1 upper verification bound.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, package hygiene, and privacy review across all stories.

- [X] T026 Review `specs/002-gnome-50-compatibility/verification-record.md`, `specs/002-gnome-50-compatibility/evidence/non-shell-tests.md`, `specs/002-gnome-50-compatibility/evidence/package-build.md`, `specs/002-gnome-50-compatibility/evidence/package-scope.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-46.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-47.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-48.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-49.md`, `specs/002-gnome-50-compatibility/evidence/gnome-shell-50.md`, and `specs/002-gnome-50-compatibility/evidence/gnome-shell-50-1.md` for credentials, tokens, cookies, authorization headers, account identifiers, and raw provider payloads
- [X] T027 Run final `tests/run-tests.sh` and update `specs/002-gnome-50-compatibility/evidence/non-shell-tests.md` with the final sanitized result
- [X] T028 Rebuild `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip` and update `specs/002-gnome-50-compatibility/evidence/package-build.md` plus `specs/002-gnome-50-compatibility/evidence/package-scope.md`
- [X] T029 Verify `metadata.json`, `README.md`, and `specs/002-gnome-50-compatibility/verification-record.md` all avoid claims for GNOME Shell 50.2, 51, or newer versions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and can start immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user story verification because the package must include the updated metadata.
- **Phase 3: User Story 1** depends on Phase 2 so GNOME Shell 50 and 50.1 checks use the updated package.
- **Phase 4: User Story 2** depends on Phase 2 so GNOME Shell 46 through 49 regression checks use the same updated package.
- **Phase 5: User Story 3** depends on User Stories 1 and 2 for complete release evidence, but README wording can be drafted after Phase 2.
- **Phase 6: Polish** depends on all selected user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2; no dependency on User Story 2.
- **User Story 2 (P1)**: Can start after Phase 2; no dependency on User Story 1.
- **User Story 3 (P2)**: Depends on final or blocked evidence from User Stories 1 and 2.

### Within Each User Story

- Run live Shell checks before changing runtime code so any Shell-specific patch is evidence-driven.
- Patch `extension.js` or `lib/compatibility.js` only if verification exposes an actual GNOME Shell compatibility issue.
- Merge per-version evidence into `verification-record.md` after rerunning any failed or blocked checks that become available.
- Document blocked checks before treating release readiness as qualified.

---

## Parallel Opportunities

- T002 and T004 can run while T001 reviews current compatibility surfaces.
- T010 and T011 can run in parallel in separate GNOME Shell 50 and 50.1 environments because they write separate evidence files.
- T014, T015, T016, and T017 can run in parallel in separate GNOME Shell 46 through 49 environments because they write separate evidence files.
- User Stories 1 and 2 can run in parallel after Phase 2 when separate Shell environments are available.

## Parallel Example: User Story 1

```text
Task: "T010 [P] [US1] Run the full GNOME Shell 50 checklist and write evidence/gnome-shell-50.md"
Task: "T011 [P] [US1] Run the full GNOME Shell 50.1 checklist and write evidence/gnome-shell-50-1.md"
```

## Parallel Example: User Story 2

```text
Task: "T014 [P] [US2] Run the GNOME Shell 46 regression smoke checklist"
Task: "T015 [P] [US2] Run the GNOME Shell 47 regression smoke checklist"
Task: "T016 [P] [US2] Run the GNOME Shell 48 regression smoke checklist"
Task: "T017 [P] [US2] Run the GNOME Shell 49 regression smoke checklist"
```

## Parallel Example: User Story 3

```text
Task: "T022 [US3] Update README.md compatibility wording"
Task: "T024 [US3] Add final release readiness summary to verification-record.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 by verifying GNOME Shell 50 and 50.1 with the updated package.
3. Stop and validate that `verification-record.md` contains pass or blocked rows for all full compatibility checks.

### Incremental Delivery

1. Finish Setup and Foundational tasks so metadata, tests, and package artifacts are ready.
2. Deliver User Story 1 for GNOME Shell 50 and 50.1 compatibility.
3. Deliver User Story 2 to prove GNOME Shell 46 through 49 behavior is preserved.
4. Deliver User Story 3 to align README, package evidence, and release readiness records.
5. Finish polish tasks for privacy, final tests, package inspection, and unsupported-version claim review.

### Release Gate

Do not treat the feature as unqualified release-ready until `specs/002-gnome-50-compatibility/verification-record.md` has pass rows for required checks on GNOME Shell 46, 47, 48, 49, 50, and 50.1, or a documented limitation for every blocked row.
