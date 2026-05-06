# Quickstart: GNOME Shell 50.1 Compatibility

## Development Setup

1. Work from feature branch `002-gnome-50-compatibility`.
2. Keep the extension source at repository root with `metadata.json` and `extension.js`.
3. Preserve the existing Codex Balance source behavior; this feature does not change Codex app-server acquisition, mock data, redaction, preferences, or status semantics.
4. Update compatibility surfaces:
   - `metadata.json` `shell-version`: `["46", "47", "48", "49", "50"]`
   - README/release-facing wording: GNOME Shell 46, 47, 48, 49, 50, and verified through 50.1
   - Release verification record: one outcome per required version/check
5. Do not document GNOME Shell 50.2 or 51 support as part of this feature.

## Non-Shell Checks

Run the existing test suite before live Shell verification:

```sh
tests/run-tests.sh
```

Expected coverage:

- Formatting for panel and menu display.
- Normal, warning, limit-reached, stale, unavailable, not-authenticated, not-configured, and error states.
- No-overlap refresh behavior.
- Stale snapshot handling.
- Codex app-server response normalization.
- ChatGPT-auth acceptance and API-key-auth rejection.
- Redaction for sensitive provider output.

## Package Build

Create a runtime-only extension archive:

```sh
mkdir -p /tmp/codex-usage-pack
gnome-extensions pack -f -o /tmp/codex-usage-pack \
  --extra-source=lib \
  --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml \
  .
```

Expected archive:

```text
/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip
```

Inspect package scope before release. It should contain runtime files only:

- `metadata.json`
- `extension.js`
- `prefs.js`
- `stylesheet.css`
- `lib/*.js`
- `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`

It must not contain development directories, generated schemas, archives, credentials, tokens, cookies, authorization headers, account identifiers, logs, or raw provider payloads.

## Local Install Flow

Install the packaged archive in each target Shell environment:

```sh
gnome-extensions install --force /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip
```

Reload GNOME Shell before enabling:

- Xorg: press `Alt`+`F2`, enter `r`, press Enter.
- Wayland: log out and back in.

Enable:

```sh
gnome-extensions enable codex-usage@rado
```

Optional GNOME Shell 50 automation where available:

```sh
gnome-shell-test-tool --extension /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip tests/testMyExtension.js
```

The optional command can help with install-and-enable coverage, but manual panel/menu verification is still required unless equivalent automated evidence exists.

## GNOME Shell 50 and 50.1 Full Checklist

Record `pass`, `fail`, or `blocked` for each check:

- Install extension from the runtime package.
- Enable extension and confirm exactly one indicator appears within 5 seconds.
- Confirm loading state appears without duplicate UI.
- Confirm valid mock or real data shows the same compact panel summary and dropdown bucket details as earlier versions.
- Confirm failed refresh shows a sanitized safe state.
- Confirm failed refresh after previous success preserves prior data as stale.
- Confirm stale data is visually distinct.
- Confirm manual refresh works.
- Confirm manual refresh during active refresh does not overlap provider work.
- Confirm not-authenticated, not-configured, malformed, timeout, and generic error states are sanitized.
- Disable extension and confirm indicator, timers, settings bindings, signals, provider work, and cached state are cleaned up.
- Reload Shell or restart session and confirm non-crashing loading, stale, or refreshed state.
- Repeat enable/disable at least 10 times and confirm no duplicate indicators, stale timers, lingering refresh work, or visible crash.

## GNOME Shell 46 Through 49 Regression Checklist

Record `pass`, `fail`, or `blocked` for each targeted version:

- Install extension from the runtime package.
- Enable extension and confirm exactly one indicator appears.
- Confirm normal data display matches existing behavior.
- Confirm manual refresh works.
- Disable extension and confirm cleanup.
- Reload Shell or restart session and confirm no existing behavior regression.

## Release Readiness Record

Use the contract in `contracts/verification-record.md`.

Minimum release gate:

- `tests/run-tests.sh`: PASS
- `metadata.json` includes `46`, `47`, `48`, `49`, and `50`
- `metadata.json` does not include `51`
- README or release notes state GNOME Shell 50.1 is the highest verified point release for this feature
- Package scope check: PASS
- Required compatibility checks for GNOME Shell 50 and 50.1: PASS, or documented limitation
- Required regression checks for GNOME Shell 46 through 49: PASS, or documented limitation

If any targeted version cannot be verified before release, record the version, missing check, reason, and release limitation explicitly.
