# Data Model: GNOME Shell 50.1 Compatibility

## SupportedShellVersion

Represents one GNOME Shell version targeted by this compatibility feature.

**Fields**:

- `versionLabel`: string, one of `46`, `47`, `48`, `49`, `50`, or `50.1`
- `metadataEntry`: string used in `metadata.json` `shell-version`
- `supportTier`: `existing`, `new-major`, or `new-point-release`
- `verificationScope`: `regression-smoke` or `full-compatibility`
- `claimStatus`: `claimed`, `blocked`, or `not-claimed`
- `highestPointReleaseClaim`: boolean

**Validation rules**:

- `46`, `47`, `48`, `49`, and `50` use matching major-version `metadataEntry` values.
- `50.1` maps to `metadataEntry: "50"` because GNOME Shell 40+ metadata uses major version strings.
- `50.1` is the only `highestPointReleaseClaim: true` row for this feature.
- Versions newer than `50.1`, including `50.2` and `51`, are outside this feature and must not appear as claimed in release-facing documentation.
- A targeted version cannot be marked release-ready unless all required behavior checks are `pass` or the release notes explicitly document a limitation.

## RuntimeBehaviorCheck

Represents one repeatable user-visible compatibility check.

**Fields**:

- `id`: stable check identifier
- `label`: human-readable check name
- `description`: expected user-visible behavior
- `requiredFor`: list of supported shell version labels
- `scope`: `full-compatibility`, `regression-smoke`, or `release-packaging`
- `evidenceType`: `manual-shell`, `shell-test-tool`, `non-shell-gjs-test`, `package-inspection`, or `documentation-review`

**Validation rules**:

- GNOME Shell 50 and 50.1 require install, enable, single indicator, dropdown, loading, normal data, failed refresh, stale data, manual refresh, safe error display, disable, shell reload, and 10-cycle enable/disable checks.
- GNOME Shell 46 through 49 require install, enable, disable, shell reload, normal data display, and manual refresh regression checks.
- Privacy and safe error display checks must remain linked to the existing non-Shell tests for redaction and source status mapping.
- Package checks must confirm runtime package contents only and must not include tests, specs, `.specify`, `.agents`, generated schemas, archives, logs, credentials, tokens, account identifiers, authorization headers, cookies, or raw provider payloads.

## CompatibilityVerificationResult

Represents one recorded outcome for a `SupportedShellVersion` and a `RuntimeBehaviorCheck`.

**Fields**:

- `shellVersion`: string matching a `SupportedShellVersion.versionLabel`
- `checkId`: string matching a `RuntimeBehaviorCheck.id`
- `status`: `pass`, `fail`, `blocked`, or `pending`
- `date`: ISO date string
- `environment`: GNOME Shell version, session type, distribution/container/VM notes, and relevant tool versions
- `evidence`: concise command output, manual observation, or linked artifact path
- `notes`: optional sanitized notes
- `blockerReason`: required when `status` is `blocked`

**Validation rules**:

- `pass` requires concrete evidence, not just an assumption.
- `fail` requires a reproducible symptom and should block release readiness until fixed or explicitly documented.
- `blocked` requires a reason, for example unavailable Shell version or missing test environment.
- `pending` is allowed during implementation planning but not in an unqualified release readiness record.
- Notes and evidence must not contain credentials, tokens, cookies, authorization headers, account identifiers, raw provider payloads, or other sensitive data.

## CompatibilityClaim

Represents one user-visible support statement.

**Fields**:

- `surface`: `metadata`, `README`, `release-notes`, `quickstart`, or `package`
- `claimedVersions`: list of version labels or metadata entries
- `highestClaimedVersion`: string
- `wording`: support statement text
- `requiresVerificationRecord`: boolean

**Validation rules**:

- `metadata` claims use major-version entries: `46`, `47`, `48`, `49`, and `50`.
- `README`, `release-notes`, and `quickstart` claims must state that this feature is verified through GNOME Shell 50.1 and must not imply verification for versions newer than 50.1.
- If any targeted version is blocked or unverified, user-facing wording must include the documented limitation.
- `package` claims must match `metadata.json` and must be inspected after packaging.

## ReleaseReadinessRecord

Represents the final compatibility release gate for this feature.

**Fields**:

- `metadataUpdated`: boolean
- `documentationUpdated`: boolean
- `nonShellTestsStatus`: `pass`, `fail`, `blocked`, or `pending`
- `packageScopeStatus`: `pass`, `fail`, `blocked`, or `pending`
- `compatibilityResults`: list of `CompatibilityVerificationResult`
- `highestVerifiedPointRelease`: string, expected `50.1`
- `limitations`: list of documented limitations

**Validation rules**:

- `metadataUpdated` is true only when `metadata.json` includes `50` and does not include `51`.
- `documentationUpdated` is true only when README or release notes identify GNOME Shell 50.1 as the highest verified point release for this feature.
- `highestVerifiedPointRelease` must be `50.1` for an unqualified completion of this feature.
- Release is not ready while any required check is `fail`, `blocked`, or `pending` unless the limitation is explicitly documented and accepted for release.
