# Feature Specification: Reset Time Countdown

**Feature Branch**: `004-reset-time-countdown`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "The reset time for 5-hour and weekly usage limit should be shown as number of hours/minutes from now, instead of date time string. For example \"Resets in 1 minute\" or \"Resets in 2h 15m\""

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand Near Reset Timing (Priority: P1)

As a Codex Usage Indicator user, I want each visible usage limit reset time to show how long remains from now, so I can quickly understand when capacity returns without interpreting a date and time.

**Why this priority**: The requested value is a more glanceable reset display for both active usage windows, and it directly affects the main information users read in the menu.

**Independent Test**: Can be tested by viewing usage details for a 5-hour or weekly limit with a known upcoming reset and verifying the displayed text is a relative countdown instead of an absolute date/time.

**Acceptance Scenarios**:

1. **Given** the 5-hour usage limit has a reset time 1 minute from now, **When** the user views the limit details, **Then** the reset text reads "Resets in 1 minute".
2. **Given** the weekly usage limit has a reset time 2 hours and 15 minutes from now, **When** the user views the limit details, **Then** the reset text reads "Resets in 2h 15m".
3. **Given** either tracked usage limit has a reset time in the future, **When** the user views usage details, **Then** the reset text communicates remaining hours and/or minutes from the current time rather than a calendar date or clock time.

---

### User Story 2 - Compare Multiple Limit Resets (Priority: P2)

As a user with both 5-hour and weekly usage limits visible, I want both reset values to use the same relative style, so I can compare which limit resets sooner.

**Why this priority**: Consistent formatting across the two limit windows prevents the user from mentally converting one display style into another.

**Independent Test**: Can be tested by viewing usage details when both 5-hour and weekly reset times are available and verifying both reset labels use relative countdown wording.

**Acceptance Scenarios**:

1. **Given** both 5-hour and weekly usage limits have reset times, **When** the user opens the usage details, **Then** both limits show reset countdowns in the same relative format.
2. **Given** one limit resets sooner than the other, **When** the user compares the two reset labels, **Then** the shorter remaining duration is apparent from the displayed countdown values.

---

### User Story 3 - Handle Boundary Reset Values (Priority: P3)

As a user, I want reset text to remain understandable when the reset is very soon, exactly on a minute boundary, or already due, so the menu never shows confusing or stale date/time text.

**Why this priority**: Boundary values are less common but are likely to be noticed when the user is waiting for a limit to reset.

**Independent Test**: Can be tested with reset times at less than a minute, exactly one minute, multiple hours, and already elapsed values, then verifying the displayed text remains clear and relative.

**Acceptance Scenarios**:

1. **Given** a reset time is less than 1 minute away, **When** the user views the limit details, **Then** the reset text clearly indicates the reset is imminent.
2. **Given** a reset time has passed or is due now, **When** the user views the limit details, **Then** the reset text does not show a future countdown or an absolute date/time string.
3. **Given** a reset time has a whole-hour duration remaining, **When** the user views the limit details, **Then** the reset text omits unnecessary zero-minute clutter.

### Edge Cases

- The reset time is less than 1 minute from the current time.
- The reset time is exactly 1 minute from the current time.
- The reset time is exactly 1 hour from the current time.
- The reset time includes both hours and minutes.
- The reset time is more than 24 hours from the current time.
- The reset time is already due or in the past because data is stale or local time changed.
- One tracked limit has a reset time while the other does not.
- Usage data is loading, stale, unavailable, malformed, or blocked by authentication/configuration.
- The system clock changes, the desktop resumes from suspend, or usage data refreshes while the menu is open.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST show reset timing for the 5-hour usage limit as a relative duration from the current time when a reset time is available.
- **FR-002**: The extension MUST show reset timing for the weekly usage limit as a relative duration from the current time when a reset time is available.
- **FR-003**: Reset timing text MUST NOT use an absolute date/time string for the 5-hour or weekly usage limit in the primary usage details.
- **FR-004**: Reset timing text MUST use the wording "Resets in" for future reset times.
- **FR-005**: A future reset time of exactly 1 minute MUST be displayed with singular minute wording, such as "Resets in 1 minute".
- **FR-006**: Future reset times that include hours and minutes MUST be displayed in compact hour/minute form, such as "Resets in 2h 15m".
- **FR-007**: Future reset times with zero remaining minutes after one or more whole hours MUST omit the zero-minute portion.
- **FR-008**: Reset timing text MUST avoid negative countdowns when the reset time is due, already elapsed, or stale.
- **FR-009**: When a reset time is unavailable for a tracked limit, the extension MUST continue to show the existing unavailable or fallback state without introducing misleading countdown text.
- **FR-010**: Relative reset text MUST update after usage data refreshes so it reflects the latest available reset time.
- **FR-011**: Relative reset text SHOULD remain understandable if the menu remains open while time passes, without requiring the user to interpret an absolute timestamp.
- **FR-012**: The feature MUST preserve existing usage amount, percentage, loading, error, authentication, configuration, stale-data, refresh interval, and refresh pause behavior.
- **FR-013**: The feature MUST NOT change what usage data is collected, stored, transmitted, or exposed to third parties.

### Key Entities *(include if feature involves data)*

- **Usage Limit Reset**: The reset moment associated with a tracked usage limit, currently relevant for the 5-hour and weekly limits.
- **Relative Reset Text**: The user-facing phrase that describes how much time remains until a usage limit resets.
- **Usage Detail Display**: The menu-visible usage information where users read limit amounts, percentages, freshness, and reset timing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In verification, 100% of available 5-hour and weekly reset values are shown as relative countdown text instead of absolute date/time strings.
- **SC-002**: Test cases for 1 minute, combined hours and minutes, whole hours, less than 1 minute, and elapsed reset values all produce understandable reset text with no negative durations.
- **SC-003**: A user can determine which visible limit resets sooner within 5 seconds when both 5-hour and weekly reset values are available.
- **SC-004**: Existing loading, error, stale, authentication/configuration, refresh interval, and refresh pause states continue to pass their current verification checks after the display change.
- **SC-005**: No usage data fields, account data, credentials, tokens, machine identifiers, or telemetry are newly displayed, stored, or transmitted as part of this feature.

## Assumptions

- The relative countdown applies to the reset labels shown in the extension's usage details for the 5-hour and weekly limits.
- Durations are rounded down to whole minutes for compact display, except values under 1 minute are shown as an imminent reset rather than zero or a negative value.
- The existing source of reset times remains authoritative; this feature changes presentation only.
- The phrase "Resets in 1 minute" is preferred for the singular one-minute case, while compact notation such as "2h 15m" is preferred for multi-hour values.
- Existing date/time formatting may remain available outside the primary 5-hour and weekly reset labels if used for unrelated metadata.
