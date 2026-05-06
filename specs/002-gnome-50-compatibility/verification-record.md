# GNOME Shell 50.1 Compatibility Verification Record

## Release Readiness Summary

- metadataUpdated: true
- documentationUpdated: true
- nonShellTestsStatus: pass
- packageScopeStatus: pass
- highestVerifiedPointRelease: 50.1
- releaseReadiness: blocked

## Limitations

- GNOME Shell 46, 47, 48, 49, and 50 live environments were not available in this workspace on 2026-05-06.
- GNOME Shell 50.1 is installed locally, but the headless Shell automation did not complete in this workspace and Codex cannot manually observe the top bar or dropdown UI. Manual GNOME Shell 50.1 checks remain required.
- An unqualified release requires replacing each blocked row with pass evidence from the matching GNOME Shell environment, or publishing the release with this explicit limitation.

## Package and Documentation Results

- shellVersion: all
  checkId: docs-version-bound
  status: pass
  date: 2026-05-06
  environment: repository documentation review
  evidence: README.md states GNOME Shell 46, 47, 48, 49, and 50 support, bounds this feature through GNOME Shell 50.1, and says versions newer than 50.1 are not verified. README.md and this record both document blocked rows as release limitations.
  notes: The review found no user-facing support claim for versions newer than GNOME Shell 50.1.
  blockerReason:

- shellVersion: all
  checkId: non-shell-tests
  status: pass
  date: 2026-05-06
  environment: `gjs 1.88.0`; local repository test harness
  evidence: `tests/run-tests.sh` exited 0 with `formatter tests passed`, `balance source tests passed`, and `redaction tests passed`. See evidence/non-shell-tests.md.
  notes: Output is sanitized and contains no credentials, tokens, account identifiers, authorization headers, cookies, or raw provider payloads.
  blockerReason:

- shellVersion: all
  checkId: package-scope
  status: pass
  date: 2026-05-06
  environment: `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`; inspected with `unzip -Z1`
  evidence: Archive contains only runtime files allowed by the package contract. See evidence/package-build.md and evidence/package-scope.md.
  notes: Packaged `metadata.json` has `shell-version` `["46", "47", "48", "49", "50"]`; no development directories, generated schema bundle, logs, archives, or sensitive/raw provider artifacts were present.
  blockerReason:

## GNOME Shell 46 Regression Results

- shellVersion: 46
  checkId: install
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for install verification.

- shellVersion: 46
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for top-bar observation.

- shellVersion: 46
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for display regression verification.

- shellVersion: 46
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for manual refresh verification.

- shellVersion: 46
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for cleanup verification.

- shellVersion: 46
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 46 unavailable in this workspace
  evidence: See evidence/gnome-shell-46.md.
  notes:
  blockerReason: Matching GNOME Shell 46 live environment was not available for shell reload verification.

## GNOME Shell 47 Regression Results

- shellVersion: 47
  checkId: install
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for install verification.

- shellVersion: 47
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for top-bar observation.

- shellVersion: 47
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for display regression verification.

- shellVersion: 47
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for manual refresh verification.

- shellVersion: 47
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for cleanup verification.

- shellVersion: 47
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 47 unavailable in this workspace
  evidence: See evidence/gnome-shell-47.md.
  notes:
  blockerReason: Matching GNOME Shell 47 live environment was not available for shell reload verification.

## GNOME Shell 48 Regression Results

- shellVersion: 48
  checkId: install
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for install verification.

- shellVersion: 48
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for top-bar observation.

- shellVersion: 48
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for display regression verification.

- shellVersion: 48
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for manual refresh verification.

- shellVersion: 48
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for cleanup verification.

- shellVersion: 48
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 unavailable in this workspace
  evidence: See evidence/gnome-shell-48.md.
  notes:
  blockerReason: Matching GNOME Shell 48 live environment was not available for shell reload verification.

## GNOME Shell 49 Regression Results

- shellVersion: 49
  checkId: install
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for install verification.

- shellVersion: 49
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for top-bar observation.

- shellVersion: 49
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for display regression verification.

- shellVersion: 49
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for manual refresh verification.

- shellVersion: 49
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for cleanup verification.

- shellVersion: 49
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 49 unavailable in this workspace
  evidence: See evidence/gnome-shell-49.md.
  notes:
  blockerReason: Matching GNOME Shell 49 live environment was not available for shell reload verification.

## GNOME Shell 50 Full Compatibility Results

- shellVersion: 50
  checkId: install
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available; local Shell tooling reports 50.1.

- shellVersion: 50
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for top-bar observation.

- shellVersion: 50
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for display verification.

- shellVersion: 50
  checkId: loading-state
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for loading-state observation.

- shellVersion: 50
  checkId: failed-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for failed-refresh observation.

- shellVersion: 50
  checkId: stale-data
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for stale-data observation.

- shellVersion: 50
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for manual refresh verification.

- shellVersion: 50
  checkId: safe-error-display
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for safe error display observation.

- shellVersion: 50
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for cleanup verification.

- shellVersion: 50
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for shell reload verification.

- shellVersion: 50
  checkId: enable-disable-10-cycles
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 50 unavailable in this workspace
  evidence: See evidence/gnome-shell-50.md.
  notes:
  blockerReason: Matching GNOME Shell 50.0 live environment was not available for repeated lifecycle verification.

## GNOME Shell 50.1 Full Compatibility Results

- shellVersion: 50.1
  checkId: install
  status: pass
  date: 2026-05-06
  environment: GNOME Shell tooling 50.1; isolated `/tmp/codex-usage-xdg` XDG home
  evidence: `gnome-extensions install --print-uuid /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip` exited 0 and printed `codex-usage@rado`; installed metadata retained `["46", "47", "48", "49", "50"]`. See evidence/gnome-shell-50-1.md.
  notes: This verifies package install compatibility without changing the user's live extension installation.
  blockerReason:

- shellVersion: 50.1
  checkId: enable-single-indicator
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1; attempted headless automation
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Headless `gnome-shell-test-tool --extension` did not complete in this workspace, and Codex cannot manually observe the top bar.

- shellVersion: 50.1
  checkId: normal-display
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual panel and dropdown observation was not available in this workspace.

- shellVersion: 50.1
  checkId: loading-state
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual loading-state observation was not available in this workspace.

- shellVersion: 50.1
  checkId: failed-refresh
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual failed-refresh observation was not available in this workspace.

- shellVersion: 50.1
  checkId: stale-data
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual stale-data observation was not available in this workspace.

- shellVersion: 50.1
  checkId: manual-refresh
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual refresh interaction was not available in this workspace.

- shellVersion: 50.1
  checkId: safe-error-display
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual safe error display observation was not available in this workspace.

- shellVersion: 50.1
  checkId: disable-cleanup
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Manual disable cleanup observation was not available in this workspace.

- shellVersion: 50.1
  checkId: shell-reload
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Shell reload or session restart was not performed from this workspace.

- shellVersion: 50.1
  checkId: enable-disable-10-cycles
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1
  evidence: See evidence/gnome-shell-50-1.md.
  notes:
  blockerReason: Ten-cycle manual lifecycle observation was not available in this workspace.
