# Contract: Compatibility Verification Record

## Status Values

Each compatibility result MUST use one of these statuses:

- `pass`: The check was executed and met the expected result.
- `fail`: The check was executed and did not meet the expected result.
- `blocked`: The check could not be executed; a blocker reason is required.
- `pending`: The check has not yet been executed; not allowed for an unqualified release readiness record.

## Required Version Matrix

| GNOME Shell Version | Required Scope | Metadata Entry | Release Claim |
|---------------------|----------------|----------------|---------------|
| 46 | Regression smoke | `46` | Existing support preserved |
| 47 | Regression smoke | `47` | Existing support preserved |
| 48 | Regression smoke | `48` | Existing support preserved |
| 49 | Regression smoke | `49` | Existing support preserved |
| 50 | Full compatibility | `50` | New support target |
| 50.1 | Full compatibility | `50` | Highest verified point release for this feature |

## Required Checks

Full compatibility checks for GNOME Shell 50 and 50.1:

| Check ID | Expected Result | Evidence Type |
|----------|-----------------|---------------|
| `install` | Extension installs from the runtime package without compatibility rejection. | `manual-shell` or `shell-test-tool` |
| `enable-single-indicator` | Enabling shows exactly one top-bar indicator within 5 seconds. | `manual-shell` or `shell-test-tool` |
| `normal-display` | Valid mock or real source data shows the expected compact summary and dropdown bucket details. | `manual-shell` |
| `loading-state` | Initial refresh shows the loading state without crash or duplicate UI. | `manual-shell` |
| `failed-refresh` | Failed refresh shows a sanitized safe state and preserves previous data as stale when available. | `manual-shell` plus `non-shell-gjs-test` |
| `stale-data` | Stale data is visibly distinct from fresh data. | `manual-shell` plus `non-shell-gjs-test` |
| `manual-refresh` | Manual refresh works and does not overlap with an active refresh. | `manual-shell` plus `non-shell-gjs-test` |
| `safe-error-display` | Authentication, configuration, malformed, timeout, and generic errors are sanitized. | `manual-shell` plus `non-shell-gjs-test` |
| `disable-cleanup` | Disabling removes UI and stops timers, settings bindings, refresh work, and provider activity. | `manual-shell` |
| `shell-reload` | Shell reload or session restart returns to a non-crashing loading, stale, or refreshed state. | `manual-shell` |
| `enable-disable-10-cycles` | Ten enable/disable cycles leave no duplicate indicators, stale timers, or lingering refresh work. | `manual-shell` |

Regression smoke checks for GNOME Shell 46 through 49:

| Check ID | Expected Result | Evidence Type |
|----------|-----------------|---------------|
| `install` | Extension installs from the runtime package. | `manual-shell` |
| `enable-single-indicator` | Enabling shows exactly one top-bar indicator. | `manual-shell` |
| `normal-display` | Valid data display matches existing behavior. | `manual-shell` |
| `manual-refresh` | Manual refresh works. | `manual-shell` |
| `disable-cleanup` | Disabling removes UI and stops owned activity. | `manual-shell` |
| `shell-reload` | Shell reload or session restart does not regress existing behavior. | `manual-shell` |

Release packaging checks:

| Check ID | Expected Result | Evidence Type |
|----------|-----------------|---------------|
| `non-shell-tests` | `tests/run-tests.sh` passes. | `non-shell-gjs-test` |
| `package-scope` | Runtime package contains only allowed files. | `package-inspection` |
| `docs-version-bound` | User-facing docs identify GNOME Shell 50.1 as the highest verified point release and do not claim newer versions. | `documentation-review` |

## Result Record Format

Use this format for each version/check outcome:

```text
- shellVersion:
  checkId:
  status:
  date:
  environment:
  evidence:
  notes:
  blockerReason:
```

Rules:

- `blockerReason` is required when `status` is `blocked`.
- `evidence` must be concrete enough for review, for example command output, package listing, Shell version, session type, or manual observation.
- Evidence and notes must be sanitized and must not include credentials, tokens, cookies, authorization headers, account identifiers, or raw provider payloads.
- An unqualified release readiness record cannot contain `fail`, `blocked`, or `pending` for required checks.
