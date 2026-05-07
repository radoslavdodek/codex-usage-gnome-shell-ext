# Verification Record: Menu Refresh Settings

## Automated Checks

| Check | Result | Notes |
|-------|--------|-------|
| Foundational settings tests | Pass | `tests/run-tests.sh` passed after schema/settings/preferences/runtime plumbing. |
| User Story 1 interval tests | Pass | `tests/run-tests.sh` passed with 1/5/30 minute labels, conversion, and defensive interval normalization coverage. |
| User Story 2 pause tests | Pass | `tests/run-tests.sh` passed with pure refresh-start guard coverage for paused and unpaused states. |
| Final non-Shell test suite | Pass | `tests/run-tests.sh` passed. |

## User Story 1 Interval Checks

| Scenario | Result | Evidence |
|----------|--------|----------|
| Interval controls visible in the menu | Blocked | Package installed and extension reported `ACTIVE` on GNOME Shell 46.0/X11, but xdotool coordinate attempts did not open the indicator menu reliably. Manual visual confirmation still required. |
| Select 1 minute from the menu | Blocked | Menu interaction could not be verified through automation. |
| Select 5 minutes from the menu | Blocked | Menu interaction could not be verified through automation. |
| Select 30 minutes from the menu | Blocked | Menu interaction could not be verified through automation. |
| Direct settings writes below 60 seconds and above 1800 seconds | Pass | Installed schema rejected `59` and `1801` with `The provided value is outside of the valid range`; settings remained `300` and `refresh-paused=false`. |
| Selected interval persists across menu reopen | Blocked | Menu reopen could not be verified through automation. |
| Automatic refresh timer reschedules without duplicates | Blocked | Requires live Shell menu/timer observation. |

## User Story 2 Pause Checks

| Scenario | Result | Evidence |
|----------|--------|----------|
| Refresh Pause switch visible in the menu | Blocked | Menu interaction could not be verified through automation. |
| Panel caption is exactly `Paused` while pause is active | Pass | Setting installed `refresh-paused=true` rendered the top-bar caption as exactly `Paused`; screenshot was reviewed locally and not committed because it contained unrelated desktop content. |
| Automatic refresh is suppressed while paused | Blocked | Requires live Shell observation through at least one configured interval. |
| Manual refresh is suppressed while paused | Blocked | Menu interaction could not be verified through automation. |
| Enabling pause during an in-progress refresh suppresses refreshing state | Blocked | Requires live Shell timing observation. |
| Disabling pause resumes refresh behavior | Partial | Installed `refresh-paused=false` restored the setting and cleared the `Paused` caption path; provider refresh behavior still needs live observation. |
| Pause setting persists across menu reopen and extension restart | Partial | Installed GSettings accepted and read back true/false; menu reopen and session restart still need live visual confirmation. |

## User Story 3 State-Reachability Checks

| Usage State | Result | Evidence |
|-------------|--------|----------|
| Loading | Blocked | Requires reliable live menu opening. |
| Normal | Blocked | Requires reliable live menu opening. |
| Stale | Blocked | Requires reliable live menu opening. |
| Unavailable | Blocked | Requires reliable live menu opening. |
| Rate-limited | Blocked | Requires reliable live menu opening. |
| Malformed or generic error | Blocked | Requires reliable live menu opening. |
| Not authenticated | Blocked | Requires reliable live menu opening. |
| Not configured | Blocked | Requires reliable live menu opening. |
| Paused | Partial | Panel caption verified as `Paused`; menu control reachability still needs live visual confirmation. |

## Final Lifecycle Validation

| Check | Result | Notes |
|-------|--------|-------|
| 10 enable/disable cycles | Blocked | A 10-cycle automation command was attempted but did not complete reliably; no lingering `gnome-extensions`, `xdotool`, or screenshot processes remained afterward, and the extension still reported `ACTIVE`. Manual cycle observation is still required. |
| Runtime package build | Pass | Built `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`; archive includes `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`. |
| Privacy review | Pass | Reviewed `README.md`, this verification record, and `evidence/README.md`; sensitive-term hits were expected policy wording or package paths, with no credentials, tokens, account identifiers, telemetry claims, or raw provider payloads recorded. |
