# Contract: Compatibility Support Declaration

## Metadata Contract

`metadata.json` MUST remain valid JSON and MUST include the existing extension identity fields:

- `uuid`: `codex-usage@rado`
- `name`: `Codex Usage Indicator`
- `description`: concise Codex Usage Indicator description
- `settings-schema`: `org.gnome.shell.extensions.codex-usage`

The `shell-version` array MUST contain:

```json
["46", "47", "48", "49", "50"]
```

The `shell-version` array MUST NOT contain:

- `51`
- `50.2`
- Any GNOME Shell version newer than `50.1` as a user-facing claim for this feature

Notes:

- GNOME Shell 40+ metadata uses major version strings. The `50` metadata entry covers the GNOME Shell 50 series for GNOME's installer compatibility check.
- The point-release support bound for this feature is recorded in README/release documentation and verification records, not by adding `50.1` to metadata.

## User-Facing Compatibility Contract

README, quickstart, and release notes MUST state:

- Existing supported versions remain GNOME Shell 46, 47, 48, and 49.
- New compatibility target covers GNOME Shell 50 and 50.1.
- GNOME Shell 50.1 is the highest verified and claimed point release for this feature.
- Versions newer than 50.1 are not verified by this feature.

If any targeted version cannot be verified, release-facing documentation MUST identify:

- The unverified version
- The blocked or missing check
- The reason verification was not completed
- Whether the release is qualified by that limitation

## Runtime Behavior Contract

On GNOME Shell 50 and 50.1, the extension MUST preserve the existing first-release behavior:

- Enabling creates exactly one top-bar Codex Usage Indicator.
- Disabling removes the indicator and stops timers, refresh work, settings bindings, signals, and provider activity.
- The top-bar summary distinguishes loading, normal, warning, limit reached, stale, not authenticated, not configured, and error states.
- The dropdown shows the same bucket details, freshness information, manual refresh action, and sanitized safe error messages as previously supported versions.
- Manual refresh does not start overlapping provider work.
- Failed refresh after a previous success preserves prior values as stale.
- No telemetry, credential display, raw payload display, or third-party transmission is introduced.

On GNOME Shell 46 through 49, the compatibility update MUST preserve the existing behavior for install, enable, disable, shell reload, normal display, and manual refresh.

## Package Contract

The runtime package SHOULD include only:

- `extension.js`
- `metadata.json`
- `prefs.js`
- `stylesheet.css`
- `lib/balanceSource.js`
- `lib/codexAppServerSource.js`
- `lib/compatibility.js`
- `lib/formatter.js`
- `lib/mockSource.js`
- `lib/model.js`
- `lib/redaction.js`
- `lib/settings.js`
- `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`

The runtime package MUST NOT include:

- `tests/`
- `specs/`
- `.specify/`
- `.agents/`
- `.git/`
- `.codex`
- `schemas/gschemas.compiled`
- Extension archives
- Logs
- Credentials, tokens, cookies, authorization headers, account identifiers, or raw provider payloads
