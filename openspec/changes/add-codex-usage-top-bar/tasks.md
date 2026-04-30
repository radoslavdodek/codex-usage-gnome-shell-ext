## 1. Extension Scaffold

- [ ] 1.1 Choose and document the extension UUID, supported GNOME Shell versions, and package directory name.
- [ ] 1.2 Create `metadata.json`, `extension.js`, and the initial GNOME Shell ES module lifecycle with enable/disable cleanup.
- [ ] 1.3 Add the source module structure for indicator UI, usage provider, usage model normalization, styles, and settings schema.
- [ ] 1.4 Add a GSettings schema for Codex command path and refresh interval, plus development instructions for compiling schemas.

## 2. Codex Usage Data

- [ ] 2.1 Implement rate-limit normalization that selects the Codex bucket and maps 300-minute and 10080-minute windows to 5-hour and weekly usage.
- [ ] 2.2 Implement asynchronous provider calls for Codex rate-limit data with timeout handling and no overlapping subprocesses.
- [ ] 2.3 Handle missing buckets, missing reset times, malformed data, command-not-found, logged-out, and provider-unavailable states.
- [ ] 2.4 Add fixture-based checks for usage normalization covering normal, missing, malformed, stale, and unavailable data.

## 3. Top-Bar Indicator UI

- [ ] 3.1 Implement the compact top-bar label showing both usage percentages with short 5-hour and weekly labels.
- [ ] 3.2 Add visual severity styling for elevated usage without increasing the panel footprint.
- [ ] 3.3 Implement the dropdown rows for 5-hour usage, weekly usage, reset times, last updated time, provider status, and errors.
- [ ] 3.4 Add a manual refresh action in the dropdown and update UI state while refresh is in progress.

## 4. Refresh Lifecycle

- [ ] 4.1 Start an immediate refresh when the extension is enabled and when the menu is opened if data is absent or stale.
- [ ] 4.2 Schedule automatic refreshes using the configured interval, defaulting to 5 minutes.
- [ ] 4.3 Remove GLib timeout sources, cancel pending provider work where possible, and destroy actors during disable.
- [ ] 4.4 Preserve last known usage values after refresh failures and mark the dropdown state as stale.

## 5. Documentation And Developer Workflow

- [ ] 5.1 Write README instructions for local install or symlink, enabling/disabling with `gnome-extensions`, and reloading GNOME Shell.
- [ ] 5.2 Document how to configure the Codex command path and refresh interval.
- [ ] 5.3 Document log inspection and debugging steps for unavailable provider and malformed data states.
- [ ] 5.4 Add any helper scripts needed for local development, packaging, or schema compilation.

## 6. Validation

- [ ] 6.1 Run OpenSpec status/validation for the change and confirm all requirements are represented by implementation tasks.
- [ ] 6.2 Run available syntax or lint checks for extension JavaScript and schema files.
- [ ] 6.3 Perform a local GNOME Shell smoke test confirming the top-bar label, dropdown details, automatic refresh, manual refresh, and error state behavior.
