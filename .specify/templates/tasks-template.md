---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests for core usage parsing/formatting whenever those paths
change. Include manual GNOME Shell verification tasks for affected lifecycle,
display, configuration, and failure-state behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Extension entry point**: `extension.js`
- **Metadata**: `metadata.json`
- **Preferences**: `prefs.js`, `schemas/` only when needed
- **Styles/assets**: `stylesheet.css`, `icons/`, `locale/` only when needed
- **Modules**: `lib/` for small GJS modules such as usage collection, formatting,
  compatibility helpers, and settings helpers
- **Tests**: `tests/` for non-Shell parser/formatter tests and fixtures
- Paths shown below are examples - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Define GNOME Shell version targets in metadata.json
- [ ] T005 Create lifecycle scaffolding in extension.js with enable/disable ownership tracking
- [ ] T006 [P] Create usage data module interface in lib/[usage-module].js
- [ ] T007 [P] Create display formatting/parsing helpers in lib/[format-module].js
- [ ] T008 Configure safe redacted logging and error-state mapping
- [ ] T009 Configure settings schema/preferences only if the feature requires user choices

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

> **NOTE: Write parser/formatter tests FIRST when this story changes usage
> interpretation or display. Add manual GNOME Shell checks for affected behavior.**

- [ ] T010 [P] [US1] Parser/formatter regression test in tests/[name].js
- [ ] T011 [US1] Manual GNOME Shell check for [install/enable/display/failure state]

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement usage state formatting in lib/[format-module].js
- [ ] T013 [P] [US1] Implement data acquisition behavior in lib/[usage-module].js
- [ ] T014 [US1] Render compact panel state in extension.js (depends on T012, T013)
- [ ] T015 [US1] Add dropdown/menu details in extension.js if required
- [ ] T016 [US1] Add validation, timeouts, cleanup, and error handling
- [ ] T017 [US1] Add redacted logs only where needed for diagnosis

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T018 [P] [US2] Parser/formatter regression test in tests/[name].js
- [ ] T019 [US2] Manual GNOME Shell check for [affected behavior]

### Implementation for User Story 2

- [ ] T020 [P] [US2] Update GJS module in lib/[module].js
- [ ] T021 [US2] Update extension lifecycle/UI integration in extension.js
- [ ] T022 [US2] Update preferences/schema in prefs.js or schemas/ if required
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T024 [P] [US3] Parser/formatter regression test in tests/[name].js
- [ ] T025 [US3] Manual GNOME Shell check for [affected behavior]

### Implementation for User Story 3

- [ ] T026 [P] [US3] Update GJS module in lib/[module].js
- [ ] T027 [US3] Update extension lifecycle/UI integration in extension.js
- [ ] T028 [US3] Update menu/preferences behavior if required

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in README.md or docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance and wakeup review across all stories
- [ ] TXXX [P] Additional parser/formatter tests in tests/
- [ ] TXXX Privacy review for logs, credentials, telemetry, and package contents
- [ ] TXXX Packaging check for metadata.json, extension.js, optional files, and unnecessary files
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Parser/formatter tests MUST be written and fail before implementation when those paths change
- Data module interface before data-source implementation
- Formatting helpers before panel/menu rendering
- Lifecycle ownership and cleanup before polling or subprocess integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests/checks for User Story 1 together:
Task: "Parser/formatter regression test in tests/[name].js"
Task: "Manual GNOME Shell check for [affected behavior]"

# Launch independent implementation work for User Story 1:
Task: "Implement usage state formatting in lib/[format-module].js"
Task: "Implement data acquisition behavior in lib/[usage-module].js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify parser/formatter tests fail before implementing when applicable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
