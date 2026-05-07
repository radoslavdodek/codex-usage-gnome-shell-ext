# Feature Specification: Menu Refresh Settings

**Feature Branch**: `004-menu-refresh-settings`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "The extensions configuration should be easily accessible for the user through the menu. The main thing which needs to be configurable is refresh interval. It should be possible to set the interval between 1 minute and 30 minutes. There should also be a "Refresh pause", so that the extension doesn't attempt to refresh the usage while it's set (in such case, the caption should say "Paused")."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change Refresh Interval From Menu (Priority: P1)

As a Codex Usage Indicator user, I want the refresh interval to be easy to find and change from the indicator menu, so I can control how often usage data updates without leaving the desktop workflow.

**Why this priority**: Refresh interval is the primary requested configuration and directly affects usefulness, background activity, and freshness.

**Independent Test**: Can be tested by opening the indicator menu, changing the refresh interval to several valid values, and verifying that the chosen value is retained and used for later automatic refreshes.

**Acceptance Scenarios**:

1. **Given** the extension is enabled, **When** the user opens the indicator menu, **Then** a configuration entry or inline control for refresh settings is visible from that menu.
2. **Given** the refresh interval control is open, **When** the user selects or enters an interval, **Then** values from 1 minute through 30 minutes are accepted.
3. **Given** the user sets a valid refresh interval, **When** the menu is reopened or the extension is re-enabled, **Then** the selected interval remains visible as the current setting.
4. **Given** a valid refresh interval has been selected, **When** automatic refreshes resume, **Then** the extension uses that selected interval without requiring the user to reload the desktop.

---

### User Story 2 - Pause Usage Refreshes (Priority: P1)

As a Codex Usage Indicator user, I want a refresh pause control in the menu, so I can temporarily stop usage refresh attempts and clearly see that the extension is paused.

**Why this priority**: The pause state is the second explicit requested behavior and must be clear enough that the user can trust the extension is not refreshing usage while paused.

**Independent Test**: Can be tested by enabling refresh pause, waiting through at least one configured interval, trying manual refresh, and verifying that no refresh starts while the caption remains "Paused".

**Acceptance Scenarios**:

1. **Given** refresh pause is off, **When** the user enables refresh pause from the menu, **Then** the top-bar caption changes to "Paused" and the menu shows that pause is active.
2. **Given** refresh pause is active, **When** the configured refresh interval elapses, **Then** the extension does not begin a usage refresh and the caption remains "Paused".
3. **Given** refresh pause is active, **When** the user attempts a manual refresh action, **Then** the extension does not start a refresh and keeps the paused state visible.
4. **Given** refresh pause is active, **When** the user turns pause off, **Then** refresh behavior resumes using the configured interval and the caption returns to the current usage state when data is available.

---

### User Story 3 - Reach Settings In Any Usage State (Priority: P2)

As a user troubleshooting or waiting for usage data, I want menu-based refresh controls to remain reachable even when data is loading, stale, unavailable, or blocked by authentication/configuration, so I can adjust refresh behavior without first fixing the data state.

**Why this priority**: Configuration access should not depend on successful usage retrieval; otherwise the feature is least available when the user most needs it.

**Independent Test**: Can be tested by putting the extension in loading, normal, stale, unauthenticated, not configured, and error states, then verifying the menu still exposes refresh interval and pause controls.

**Acceptance Scenarios**:

1. **Given** no usage data has loaded yet, **When** the user opens the menu, **Then** refresh interval and pause controls are still reachable.
2. **Given** usage data is stale, unavailable, unauthenticated, not configured, or in an error state, **When** the user opens the menu, **Then** refresh interval and pause controls are still reachable.
3. **Given** the extension is disabled and re-enabled, **When** the user opens the menu again, **Then** the previously selected interval and pause state are preserved.

### Edge Cases

- The user opens the menu while the first usage refresh is still loading.
- The user enables refresh pause while a refresh is already in progress.
- The configured interval elapses while refresh pause is active.
- The user tries to manually refresh while refresh pause is active.
- The user disables, re-enables, or reloads the extension while refresh pause is active.
- The user or system attempts to set an interval below 1 minute or above 30 minutes.
- The selected interval changes while a previous automatic refresh cadence would otherwise be due.
- Usage data is valid, stale, unavailable, rate-limited, malformed, or blocked by authentication/configuration while refresh settings are being changed.
- No previous successful usage data exists when refresh pause is enabled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The indicator menu MUST expose a clear way to access extension configuration related to refresh behavior.
- **FR-002**: The menu-accessible configuration MUST include a refresh interval control.
- **FR-003**: The refresh interval control MUST accept intervals from 1 minute through 30 minutes, inclusive.
- **FR-004**: Refresh interval choices MUST be presented to users in whole minutes.
- **FR-005**: The default refresh interval MUST remain 5 minutes unless the user changes it.
- **FR-006**: A valid refresh interval change MUST take effect without requiring the user to disable, re-enable, or reload the extension.
- **FR-007**: The selected refresh interval MUST persist across menu reopen, extension disable/enable, and desktop session restart.
- **FR-008**: The indicator menu MUST expose a refresh pause control.
- **FR-009**: When refresh pause is active, the top-bar caption MUST read exactly "Paused".
- **FR-010**: When refresh pause is active, the extension MUST NOT start automatic usage refresh attempts.
- **FR-011**: When refresh pause is active, the extension MUST NOT start manual usage refresh attempts.
- **FR-012**: When refresh pause is enabled during an in-progress refresh, the extension MUST settle into the paused state without leaving a visible refreshing state active.
- **FR-013**: When refresh pause is turned off, the extension MUST resume usage refresh behavior using the selected refresh interval.
- **FR-014**: The menu MUST make the current refresh interval and current pause state visible to the user.
- **FR-015**: Refresh interval and pause controls MUST remain reachable from the menu while usage data is loading, valid, stale, unavailable, rate-limited, malformed, unauthenticated, not configured, or in an error state.
- **FR-016**: Out-of-range refresh interval values MUST be rejected or corrected to the nearest valid value without crashing, looping refreshes, or hiding the menu controls.
- **FR-017**: Changing refresh settings MUST NOT create duplicate top-bar indicators, duplicate refresh activity, or stale menu state after repeated enable/disable cycles.
- **FR-018**: Refresh pause and interval settings MUST NOT change the existing privacy behavior; usage data, account data, credentials, tokens, and telemetry MUST NOT be transmitted to third parties.
- **FR-019**: Existing usage display, freshness details, error states, and manual refresh behavior MUST remain unchanged except where refresh pause intentionally suppresses refresh attempts and shows "Paused".

### Key Entities *(include if feature involves data)*

- **Refresh Settings**: User-selected refresh behavior, including the refresh interval in minutes and whether refresh pause is active.
- **Refresh Pause State**: A temporary user-controlled state that suppresses usage refresh attempts and replaces the top-bar usage caption with "Paused".
- **Usage Display State**: The visible top-bar caption and menu details for loading, valid, stale, unavailable, rate-limited, malformed, unauthenticated, not configured, error, and paused states.
- **Menu Configuration Entry**: The menu-accessible control or entry point that lets users view and change refresh settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the indicator menu and locate refresh interval and pause controls in under 10 seconds without opening a separate extension manager.
- **SC-002**: In verification, refresh intervals of 1, 5, and 30 minutes are accepted and displayed correctly, while values below 1 minute and above 30 minutes are rejected or corrected in 100% of tested attempts.
- **SC-003**: With refresh pause active for at least one full configured interval, the top-bar caption remains "Paused" and no loading or refreshing state becomes visible.
- **SC-004**: Manual refresh attempts made while refresh pause is active result in zero usage refresh starts in 100% of tested attempts.
- **SC-005**: After refresh pause is turned off, the extension resumes normal usage display and refresh behavior within one configured interval.
- **SC-006**: Refresh interval and pause controls remain reachable in 100% of tested loading, normal, stale, unauthenticated, not configured, and error states.
- **SC-007**: Repeated enable/disable testing across at least 10 cycles produces no duplicate indicators, duplicate refresh activity, lost refresh settings, or user-visible crashes.

## Assumptions

- The default refresh interval remains 5 minutes because that is the current conservative default for normal usage.
- Refresh interval configuration is limited to whole-minute values; second-level precision is out of scope.
- Refresh pause applies to both automatic and manual refresh attempts until the user turns pause off.
- Existing usage details may remain visible in the menu while paused, but the top-bar caption is "Paused".
- Existing source selection, display format, warning threshold, authentication behavior, and privacy behavior remain in scope only insofar as they must continue working with the new refresh settings.
- The setting is local to the current desktop user and persists using the extension's existing preference storage behavior.
