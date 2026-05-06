# Feature Specification: Top-bar Codex Balance Usage Indicator

**Feature Branch**: `001-codex-balance-indicator`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Create a feature specification for the first release of Codex Usage Indicator, a GNOME Shell extension that displays the same Codex Balance usage data shown on https://chatgpt.com/codex/cloud/settings/analytics#usage in the GNOME top bar."

## Clarifications

### Session 2026-04-30

- Q: What should determine whether the first release is complete if no stable source exists yet? → A: First release is not complete until a real source path is verified and planned.
- Q: When should previously successful Balance data become stale by age? → A: Data becomes stale after 2x the configured automatic refresh interval without a successful refresh.
- Q: How should the first release handle multiple ChatGPT workspaces or accounts? → A: Use the selected source's default authenticated context; no workspace selection in first release.
- Q: Which GNOME Shell versions should the first release support? → A: GNOME Shell 46 through 49.
- Q: How should bucket reset times be displayed? → A: Display reset times in the user's local timezone using GNOME/locale formatting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Glance at Current Balance (Priority: P1)

As a Codex user on GNOME, I want a compact top-bar indicator that summarizes my current Codex Balance state, so I can tell at a glance whether my usage is normal, low, at a limit, stale, or unavailable without opening ChatGPT or a terminal.

**Why this priority**: This is the core value of the first release and satisfies the primary daily workflow.

**Independent Test**: Can be tested by enabling the extension with representative Balance data and verifying that exactly one top-bar item appears with a compact state derived from the most constrained available bucket.

**Acceptance Scenarios**:

1. **Given** the extension is installed and enabled, **When** GNOME Shell loads, **Then** exactly one Codex Balance indicator appears in the top bar.
2. **Given** the source reports 87% remaining for the 5-hour limit and 95% remaining for the weekly limit, **When** the panel indicator is rendered, **Then** it summarizes the 5-hour bucket as the most constrained bucket.
3. **Given** the 5-hour bucket has 20% remaining and the weekly bucket has 95% remaining, **When** the panel indicator is rendered, **Then** the overall state is warning unless the user has configured a different threshold.
4. **Given** either bucket has 0% remaining, **When** the panel indicator is rendered, **Then** it communicates a limit-reached state.

---

### User Story 2 - Inspect Detailed Balance Buckets (Priority: P1)

As a Codex user, I want the indicator menu to show the two Balance buckets shown on the ChatGPT Codex analytics usage page, so I can see the 5-hour and weekly remaining percentages and reset times in one place.

**Why this priority**: The top-bar summary is only trustworthy if the user can inspect the exact underlying Balance buckets.

**Independent Test**: Can be tested by opening the indicator menu after a successful refresh and verifying that both required buckets, reset information, freshness, and current state are shown.

**Acceptance Scenarios**:

1. **Given** valid Balance data is available, **When** the user opens the dropdown, **Then** the menu shows "5-hour usage limit", percent remaining, reset time, and status.
2. **Given** valid Balance data is available, **When** the user opens the dropdown, **Then** the menu shows "Weekly usage limit", percent remaining, reset date/time, and status.
3. **Given** a successful refresh has occurred, **When** the user opens the dropdown, **Then** the menu shows the last successful refresh time and current data state.
4. **Given** one bucket is unavailable but the other is valid, **When** the user opens the dropdown, **Then** the valid bucket remains visible and the unavailable bucket is clearly marked.

---

### User Story 3 - Refresh Without Disrupting the Desktop (Priority: P2)

As a Codex user, I want usage data to refresh automatically and manually without freezing the desktop, so the indicator stays useful while GNOME Shell remains responsive.

**Why this priority**: Freshness matters, but the constitution requires stability, conservative polling, and non-blocking behavior.

**Independent Test**: Can be tested by triggering manual and automatic refreshes against successful, slow, failed, malformed, unauthenticated, and rate-limited data states while verifying that the UI remains responsive and prior good data is preserved when appropriate.

**Acceptance Scenarios**:

1. **Given** the user selects manual refresh, **When** the source responds successfully, **Then** the indicator and dropdown reflect the new Balance values.
2. **Given** a refresh is already in progress, **When** the user selects manual refresh, **Then** the extension avoids overlapping refresh work and communicates that refresh is in progress or schedules one safe refresh.
3. **Given** valid data was previously retrieved, **When** a later refresh fails, **Then** the last successful values remain visible and are marked stale or failed.
4. **Given** the selected source times out, **When** refresh ends, **Then** the extension shows a safe failure state without blocking GNOME Shell.

---

### User Story 4 - Understand Source and Configuration Problems (Priority: P2)

As a Codex user, I want clear, sanitized messages when Balance data cannot be retrieved, so I can distinguish not authenticated, not configured, stale, and error states without exposing sensitive values.

**Why this priority**: The first release depends on a source whose official machine-readable availability must be confirmed, so failure states must be explicit and safe.

**Independent Test**: Can be tested by using unauthenticated, unconfigured, malformed, unavailable, and rate-limited source responses and verifying that the indicator and menu show distinct states with no credentials, cookies, tokens, account identifiers, authorization headers, or raw payloads.

**Acceptance Scenarios**:

1. **Given** the user is not authenticated to the selected source, **When** refresh runs, **Then** the indicator shows a not-authenticated state and the dropdown explains the issue without exposing secrets.
2. **Given** the selected source requires configuration that is missing or invalid, **When** refresh runs, **Then** the indicator shows a not-configured state and the dropdown provides an actionable message.
3. **Given** provider output or errors contain sensitive-looking tokens, cookies, or authorization headers, **When** errors are displayed or logged, **Then** those values are redacted.
4. **Given** the source returns malformed data, **When** refresh completes, **Then** the extension shows an error state without crashing GNOME Shell.

---

### User Story 5 - Clean Lifecycle and First-Release Verification (Priority: P3)

As a user who enables, disables, reloads, or updates the extension, I want it to clean up after itself reliably, so it does not create duplicate indicators, stale timers, lingering refreshes, or unstable desktop behavior.

**Why this priority**: Lifecycle correctness is constitutionally required for GNOME Shell safety and extension review readiness.

**Independent Test**: Can be tested by repeatedly enabling, disabling, and reloading the extension while checking for duplicate UI, continuing refresh activity, and stale state.

**Acceptance Scenarios**:

1. **Given** the extension is disabled, **When** disable completes, **Then** the indicator disappears and no refresh timer or provider operation continues running.
2. **Given** the user repeatedly enables and disables the extension, **When** the cycle completes, **Then** no duplicate panel items, timers, signal handlers, stale refresh operations, or subprocesses remain.
3. **Given** GNOME Shell reloads or the system resumes from suspend, **When** the extension becomes active again, **Then** it returns to a clear loading, stale, or refreshed state without crashing.
4. **Given** the first release is packaged, **When** package contents are reviewed, **Then** it contains only files required for implemented functionality.

### Edge Cases

- Usage data is loading and no previous successful snapshot exists.
- Usage data is valid, stale, unavailable, rate-limited, malformed, or blocked by authentication or configuration.
- Only the 5-hour bucket is available.
- Only the weekly bucket is available.
- A percent value is missing, outside 0-100, non-numeric, or ambiguous.
- Reset time is missing, relative for one bucket and absolute for another, localized differently, or in a different time zone.
- The ChatGPT Codex analytics usage page is reachable but the Balance section is absent.
- The user is signed out of the selected source.
- The user has access to multiple ChatGPT workspaces or plans with different limits.
- The selected Codex plan has different Balance labels or reset cadence than expected.
- The page or source structure changes.
- The source rate-limits requests or the network is unavailable.
- GNOME Shell reloads, the extension is disabled during refresh, or the system resumes from suspend.
- Manual refresh is selected while a refresh is already in progress.
- Preferences are missing, invalid, or outside accepted ranges.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When enabled, the extension MUST add exactly one Codex Balance indicator to the GNOME top bar.
- **FR-002**: When disabled, the extension MUST remove the indicator and clean up timers, signals, settings bindings, cached UI state, and any in-progress refresh work.
- **FR-003**: The extension MUST retrieve or derive the same two Balance buckets shown on the ChatGPT Codex analytics usage page: 5-hour usage limit and weekly usage limit.
- **FR-004**: For each Balance bucket, the extension MUST represent percent remaining and reset time when those values are available.
- **FR-005**: The default top-bar summary MUST derive overall state from the available bucket with the lower remaining percentage.
- **FR-006**: The default top-bar text MUST be compact, MUST avoid continuous animation, and MUST use a short format such as the lowest bucket label plus percent or a concise state label.
- **FR-007**: The dropdown menu MUST show both Balance buckets with label, percent remaining, reset time or reset date/time, and a visual or textual status.
- **FR-008**: The dropdown menu MUST show last successful refresh time when available, current data state, a manual refresh action, and an error or authentication/configuration message when relevant.
- **FR-009**: The extension MUST clearly distinguish loading, normal, warning, limit reached, stale, not authenticated, not configured, and error states.
- **FR-010**: The user MUST be able to manually refresh usage data from the dropdown.
- **FR-011**: The extension MUST automatically refresh usage data on a conservative interval.
- **FR-012**: Refresh operations MUST NOT block GNOME Shell UI responsiveness and MUST have timeout handling.
- **FR-013**: Failed refresh MUST preserve the last known good Balance snapshot when one exists and mark the data stale or failed.
- **FR-014**: Repeated failures MUST NOT spam notifications or logs.
- **FR-015**: Usage data acquisition MUST be isolated from panel and menu rendering behind a replaceable source interface.
- **FR-016**: The source interface MUST support refresh, returning the last snapshot, reporting current status, canceling or cleaning up in-progress work, and sanitized error reporting.
- **FR-017**: The normalized Balance snapshot MUST include separate 5-hour and weekly buckets with percent remaining, reset time, and bucket status.
- **FR-018**: The normalized Balance snapshot MUST include overall status, top-bar display text, dropdown detail text, last successful update time, source identifier, and optional sanitized error message.
- **FR-019**: Bucket statuses MUST support normal, warning, limit reached, stale, unavailable, and error.
- **FR-020**: Overall statuses MUST support loading, normal, warning, limit reached, stale, not authenticated, not configured, and error.
- **FR-021**: Default status mapping MUST treat more than 25% remaining as normal, 1% through 25% remaining as warning, and 0% remaining as limit reached unless the user configures a different threshold.
- **FR-022**: Stale status MUST be used when a last successful Balance snapshot exists but a later refresh fails or no successful refresh has occurred for 2x the configured automatic refresh interval.
- **FR-023**: If no official or stable machine-readable source for exact Balance data is available, the first release plan MUST explicitly document that limitation and keep the source replaceable.
- **FR-024**: A development-only mock source MAY be used for verification, but the feature MUST NOT be considered complete until a real source path is verified, selected, and planned.
- **FR-025**: If the selected source requires ChatGPT authentication, the extension MUST handle unauthenticated sessions without storing or exposing credentials.
- **FR-026**: If the selected source reads from the ChatGPT Codex analytics usage page, it MUST handle absent Balance sections, changed structure, unauthenticated sessions, parse failures, and sensitive data redaction.
- **FR-027**: If the selected source uses a local Codex command, the plan MUST verify that the command exposes the same 5-hour and weekly Balance data before relying on it.
- **FR-028**: If an official source is available, the plan MUST document the data fields, authentication expectations, authorization failure behavior, rate limiting behavior, malformed response behavior, and privacy implications.
- **FR-029**: The extension MUST NOT collect analytics, telemetry, or transmit Codex Balance data to third-party services.
- **FR-030**: Credentials, cookies, session tokens, account identifiers, authorization headers, and raw source payloads MUST NOT be logged, displayed, hardcoded, committed, or stored in plain text.
- **FR-031**: Provider errors shown to users or logs MUST be sanitized.
- **FR-032**: Optional preferences MAY include refresh interval, warning threshold, top-bar display format, selected source, source-specific local command path, and whether the panel prioritizes 5-hour, weekly, or lowest remaining value.
- **FR-033**: Defaults MUST be safe and useful, and invalid preferences MUST be rejected or handled gracefully.
- **FR-034**: The first release MUST use the selected source's default authenticated ChatGPT context and MUST NOT require workspace or account selection.
- **FR-035**: The first release MUST target GNOME Shell versions 46 through 49.
- **FR-036**: The first release MUST include a manual verification checklist covering install, enable, disable, reload, missing configuration, failed refresh, stale data, normal data, manual refresh, sensitive error redaction, and compatibility with GNOME Shell versions 46 through 49.
- **FR-037**: The extension package MUST include only files required for the implemented first-release functionality.
- **FR-038**: Reset times MUST be displayed in the user's local timezone using GNOME or system locale formatting when the source provides parseable time data.

### Key Entities *(include if feature involves data)*

- **Codex Balance Snapshot**: A normalized view of the current Balance state, including both 5-hour and weekly limits, overall status, display text, detail text, last successful update time, source identifier, and optional sanitized error message.
- **Balance Bucket**: One usage limit from the Balance section. Each bucket has a label, percent remaining, reset time or reset text, and status.
- **Data Source**: The selected way to obtain Balance data. It may represent an official source, local command, browser-authenticated session, mock source, or unknown source, but it must never expose secrets through UI or logs.
- **Refresh State**: The current lifecycle of data retrieval, such as loading, successful, failed with previous data, unauthenticated, unconfigured, rate-limited, canceled, or timed out.
- **Display Preference**: A user-controlled choice that affects presentation or safe polling behavior, such as display format, warning threshold, refresh interval, selected source, and bucket priority.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a normal data state, a user can identify whether Codex Balance is normal, warning, or limit reached from the top bar in under 5 seconds without opening ChatGPT, a terminal, or another dashboard.
- **SC-002**: In a detailed data state, a user can open the menu and confirm both 5-hour and weekly remaining percentages and reset times in under 10 seconds.
- **SC-003**: Manual verification covers at least these paths before release: install, enable, disable, shell reload, missing configuration, unauthenticated source, failed refresh, stale data, malformed data, normal data, manual refresh, repeated enable/disable, sensitive error redaction, and compatibility with GNOME Shell versions 46 through 49.
- **SC-004**: Repeated enable/disable testing across at least 10 cycles produces no duplicate indicators, duplicate timers, stale refresh work, lingering source operations, or user-visible crashes.
- **SC-005**: Representative malformed, unavailable, unauthenticated, rate-limited, and timeout source states all produce a clear non-crashing user-visible state.
- **SC-006**: Failed refresh after a previous success keeps the last successful Balance values visible and marks them stale or failed in 100% of tested failure cases.
- **SC-007**: Sensitive-looking values in representative source errors are redacted from all user-visible messages and recorded logs in 100% of redaction tests.
- **SC-008**: Core Balance normalization, status mapping, stale-data handling, and display formatting are verifiable outside a live GNOME Shell session.
- **SC-009**: The packaged first release contains only necessary extension files and no credentials, tokens, raw captured page payloads, or unrelated project artifacts.

## Assumptions

- The first release targets a single local desktop user viewing their own Codex Balance.
- The primary source of truth is the Balance section shown on `https://chatgpt.com/codex/cloud/settings/analytics#usage`.
- The exact official or stable machine-readable source for that Balance data is not assumed to exist; source research and selection are required during implementation planning.
- A mock source is acceptable for development and verification but not sufficient for a complete first release.
- The default warning threshold is 25% because it gives users time to react before reaching a limit while keeping the top-bar state calm during normal usage.
- The default panel priority is the lowest remaining percentage because it best represents the user's most constrained Codex Balance bucket.
- Automatic refresh should be conservative by default; the exact interval and timeout belong in the implementation plan after source behavior is known, and stale-age handling is based on 2x the configured interval.
- Preferences are optional for the first release unless the chosen source or safe defaults require user configuration.
- Multiple ChatGPT workspaces are handled by the selected source's default authenticated context for the first release; workspace or account selection is out of scope for the first release.
- Notifications are disabled by default; failures are communicated through the indicator and menu.
- The implementation plan must decide source path, default top-bar text format, refresh timeout, refresh interval, unparseable reset-time fallback behavior, and the minimum manual test matrix for GNOME Shell versions 46 through 49.
