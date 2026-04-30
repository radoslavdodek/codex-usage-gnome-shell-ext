## Why

Developers need quick visibility into Codex usage limits while they work, without switching to another app or browser tab. A compact GNOME Shell top-bar indicator can make the current 5-hour and weekly usage state visible at a glance.

## What Changes

- Add a GNOME Shell extension that displays Codex usage percentages in the top bar for the active 5-hour window and weekly limit.
- Show the next reset time for both usage windows.
- Support signing in to the user's ChatGPT subscription through a Codex-managed ChatGPT authentication flow when usage data requires account authentication.
- Provide a compact, developer-friendly top-bar presentation with a clicked dropdown/popover for more detail.
- Refresh usage automatically on a reasonable interval and allow graceful degradation when usage data is unavailable.
- Add installation and local development instructions for the extension.

## Capabilities

### New Capabilities

- `codex-usage-indicator`: A GNOME Shell top-bar indicator for Codex usage percentages, reset times, ChatGPT subscription sign-in state, details, refresh behavior, error states, and extension installation/development guidance.

### Modified Capabilities

None.

## Impact

- Adds GNOME Shell extension source files and metadata.
- Requires account and usage data integration points for ChatGPT/Codex subscription status, Codex usage percentages, and reset times.
- Adds extension styling, user-facing UI states, refresh scheduling, and documentation.
- Adds sign-in UI state, sign-in action handling, and security constraints around delegated authentication.
- May introduce GNOME Shell JavaScript conventions and development tooling such as local install scripts or lint/check commands.
