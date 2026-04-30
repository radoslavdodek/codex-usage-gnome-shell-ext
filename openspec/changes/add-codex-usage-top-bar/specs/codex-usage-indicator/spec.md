## ADDED Requirements

### Requirement: Top-Bar Usage Summary
The extension SHALL display a compact GNOME Shell top-bar indicator that includes the current Codex usage percentage for the 5-hour window and the current Codex usage percentage for the weekly limit.

#### Scenario: Both usage windows are available
- **WHEN** Codex usage data contains valid 5-hour and weekly usage percentages
- **THEN** the top-bar indicator displays both percentages with compact labels for the 5-hour and weekly windows

#### Scenario: Usage approaches a limit
- **WHEN** either displayed usage percentage is at or above a warning threshold
- **THEN** the top-bar indicator visually distinguishes the elevated usage state without expanding the top-bar footprint

### Requirement: Reset Time Visibility
The extension SHALL show the next reset time for the 5-hour window and the next reset time for the weekly limit.

#### Scenario: Reset times are available
- **WHEN** Codex usage data contains reset timestamps for both usage windows
- **THEN** the dropdown displays the reset time for each window in the user's local time

#### Scenario: A reset time is missing
- **WHEN** Codex usage data omits the reset timestamp for one usage window
- **THEN** the dropdown marks that reset time as unknown while preserving the available usage percentage

### Requirement: Usage Detail Dropdown
The extension SHALL open a dropdown or popover when the top-bar indicator is clicked and SHALL show more detail than the compact top-bar label.

#### Scenario: User opens the indicator menu
- **WHEN** the user clicks the top-bar indicator
- **THEN** the extension displays a menu containing the 5-hour usage, weekly usage, reset times, last updated time, ChatGPT account state, and current data source status

#### Scenario: User requests an immediate refresh
- **WHEN** the user activates the refresh action from the dropdown
- **THEN** the extension starts a usage refresh and updates the displayed status when the refresh completes

### Requirement: ChatGPT Subscription Sign-In
The extension SHALL allow the user to sign in to a ChatGPT subscription through a delegated Codex-managed ChatGPT authentication flow and SHALL NOT collect ChatGPT passwords or store raw authentication tokens.

#### Scenario: Account authentication is required
- **WHEN** Codex account state reports that ChatGPT authentication is required
- **THEN** the dropdown displays a sign-in action for the user's ChatGPT subscription

#### Scenario: User starts ChatGPT sign-in
- **WHEN** the user activates the ChatGPT sign-in action
- **THEN** the extension starts the Codex-managed ChatGPT login flow and opens the returned authorization URL or verification URL in the user's default browser

#### Scenario: Device code sign-in is required
- **WHEN** the Codex-managed sign-in flow returns a device code
- **THEN** the dropdown displays the one-time user code and verification URL until the sign-in completes, fails, or is canceled

#### Scenario: ChatGPT sign-in succeeds
- **WHEN** the delegated ChatGPT sign-in flow completes successfully
- **THEN** the extension refreshes account and usage data and displays the ChatGPT account email and plan type when available

#### Scenario: ChatGPT sign-in fails or is canceled
- **WHEN** the delegated ChatGPT sign-in flow fails or is canceled
- **THEN** the extension returns to a retryable signed-out state and shows a concise error in the dropdown

### Requirement: Automatic Refresh
The extension SHALL refresh Codex usage data automatically at a reasonable interval and SHALL avoid overlapping refreshes.

#### Scenario: Refresh interval elapses
- **WHEN** the configured refresh interval elapses while the extension is enabled
- **THEN** the extension fetches fresh Codex usage data and updates the top-bar and dropdown displays

#### Scenario: Refresh is already in progress
- **WHEN** a scheduled or manual refresh is requested while another refresh is still running
- **THEN** the extension does not start a second concurrent refresh

### Requirement: Unavailable And Error States
The extension SHALL handle unavailable Codex usage data, provider failures, malformed data, and logged-out states gracefully.

#### Scenario: Usage provider is unavailable
- **WHEN** the extension cannot reach the Codex usage provider
- **THEN** the top-bar indicator shows an unavailable state and the dropdown shows a concise explanation

#### Scenario: Existing data becomes stale
- **WHEN** the latest refresh fails after previously successful usage data was displayed
- **THEN** the extension keeps the last known usage values visible and marks them as stale in the dropdown

#### Scenario: Provider returns malformed data
- **WHEN** the usage provider returns data that cannot be parsed into the required usage windows
- **THEN** the extension records an error state without throwing an uncaught GNOME Shell exception

### Requirement: GNOME Shell Extension Packaging
The extension SHALL follow GNOME Shell extension conventions and include installation and development instructions.

#### Scenario: Extension package is inspected
- **WHEN** a developer reviews the extension source tree
- **THEN** the source includes GNOME Shell extension metadata, an extension entry point, source files, styling as needed, and documentation for installing and enabling the extension locally

#### Scenario: Developer runs local development workflow
- **WHEN** a developer follows the documented development instructions
- **THEN** they can install or symlink the extension locally, reload GNOME Shell as appropriate for their session type, enable the extension, and inspect logs
