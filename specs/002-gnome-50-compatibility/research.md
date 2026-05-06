# Research: GNOME Shell 50.1 Compatibility

## GNOME Shell 50 API Compatibility

**Decision**: Keep the existing GNOME Shell extension architecture and perform compatibility validation before changing runtime APIs. The current ESM-style extension entry point, `PanelMenu.Button` panel item, `PopupMenu` menu rows, `St` labels/layouts, `Gio.Subprocess` provider, `GLib.timeout_add_seconds()` polling, and GSettings preferences remain the planned implementation surface for GNOME Shell 50 and 50.1.

**Rationale**: The GNOME Shell 50 porting guide states that there are no relevant changes to `metadata.json`, `extension.js`, or `prefs.js` for GNOME Shell 50. The listed Shell 50 changes are additive or unrelated to this extension's current APIs. This extension also already targets GNOME Shell 46 through 49 using GNOME 45+ ES modules, which is the same extension architecture expected by the current GNOME Shell documentation.

**Alternatives considered**:

- Proactively refactor panel/menu code for Shell 50: rejected because the official porting guide does not identify required changes for the APIs this extension uses.
- Add version-specific code paths before testing: rejected because it increases maintenance risk without a known compatibility break.
- Replace manual Shell verification with non-Shell unit tests only: rejected because install, enable, disable, menu rendering, shell reload, and lifecycle cleanup must be observed in a running Shell.

**Sources checked**:

- GNOME JavaScript, Port Extensions to GNOME Shell 50: `https://gjs.guide/extensions/upgrading/gnome-shell-50.html`
- GNOME JavaScript, Anatomy of an Extension: `https://gjs.guide/extensions/overview/anatomy.html`
- GNOME JavaScript, Targeting Older GNOME Versions: `https://gjs.guide/extensions/development/targeting-older-gnome.html`

## Supported Version Declaration and 50.1 Bound

**Decision**: Update `metadata.json` from `["46", "47", "48", "49"]` to `["46", "47", "48", "49", "50"]`. Do not add `51` or any future major version. Because official GNOME Shell metadata guidance uses major version strings for GNOME 40 and newer, record the point-release support bound separately in user-visible release documentation and the compatibility verification record: GNOME Shell 50.1 is the highest verified and claimed point release for this feature.

**Rationale**: GNOME extension metadata requires `shell-version` to contain supported Shell versions, and current documentation says GNOME 40+ entries should be major version strings such as `40` or `41`. The feature still needs a clear user-facing upper bound of 50.1. Therefore metadata enables the GNOME 50 stable series according to GNOME's convention, while README/release notes/verification artifacts state that only 50.0 and 50.1 are in scope for this feature. As of 2026-05-06, the GNOME release calendar lists GNOME 50.1 as a stable release dated 2026-04-11 and GNOME 50.2 as a future stable release scheduled for 2026-05-23, so 50.2 must not be documented as verified by this feature.

**Alternatives considered**:

- Add `"50.1"` to `metadata.json`: rejected because current GNOME documentation says GNOME 40+ metadata should use the major version only.
- Add `"50"` and state support for all future GNOME 50 point releases: rejected because the user request and feature specification bound this feature to 50.1.
- Add a runtime block for Shell versions newer than 50.1: rejected for the planning baseline because GNOME metadata is the standard compatibility gate, and a runtime block would create a new user-visible failure mode not requested by the feature. If release policy later requires this, it should be specified explicitly.

**Sources checked**:

- GNOME JavaScript, Anatomy of an Extension, `shell-version`: `https://gjs.guide/extensions/overview/anatomy.html`
- GNOME JavaScript, Targeting Older GNOME Versions: `https://gjs.guide/extensions/development/targeting-older-gnome.html`
- GNOME Release Calendar: `https://release.gnome.org/calendar/`

## Compatibility Verification Matrix

**Decision**: Treat compatibility evidence as a release artifact with one row per targeted GNOME Shell version and runtime behavior check. Full checks are required for GNOME Shell 50 and 50.1. Regression smoke checks are required for GNOME Shell 46, 47, 48, and 49. Each result must be recorded as `pass`, `fail`, or `blocked`; any blocked version needs a reason and prevents an unqualified release claim.

**Rationale**: The feature's measurable outcomes require documented results for 46, 47, 48, 49, 50, and 50.1. Non-Shell tests can catch parser, formatter, stale-state, source, and redaction regressions, but compatibility with Shell version loading and UI lifecycle still requires a live Shell or equivalent Shell test tool. GNOME Shell 50 adds a `gnome-shell-test-tool --extension` option that can help automate install-and-enable checks where available, but the manual checklist remains the acceptance baseline.

**Alternatives considered**:

- Verify only GNOME Shell 50.1: rejected because the update must preserve the existing 46 through 49 behavior.
- Record only a single pass/fail per Shell version: rejected because release readiness needs to show which user-visible behavior failed or was blocked.
- Require complete automation before planning tasks: rejected because this repository currently relies on non-Shell GJS tests plus manual Shell verification.

**Sources checked**:

- GNOME JavaScript, Port Extensions to GNOME Shell 50: `https://gjs.guide/extensions/upgrading/gnome-shell-50.html`

## Runtime Behavior Scope

**Decision**: Keep the Codex Balance source, normalization, refresh scheduling, redaction, preferences, and status rendering behavior unchanged unless compatibility testing exposes a Shell 50/50.1 regression. The planned implementation should focus on metadata, documentation, compatibility checklist updates, and minimal compatibility helpers only if a concrete Shell API difference is found.

**Rationale**: The feature changes supported GNOME Shell scope, not Codex data acquisition or UI semantics. Preserving the existing behavior reduces the risk of breaking already supported versions and keeps the compatibility change reviewable.

**Alternatives considered**:

- Fold feature work into provider or UI redesign: rejected as unrelated to Shell 50.1 compatibility.
- Remove support for older versions while adding Shell 50: rejected because the specification requires preserving GNOME Shell 46 through 49 support.

## Release Documentation

**Decision**: Update README/release-facing documentation to say the extension supports GNOME Shell 46, 47, 48, 49, 50, and has been verified through 50.1 for this feature. The release gate must include a compatibility matrix, package scope check, and explicit note for any targeted version that was not verified.

**Rationale**: `metadata.json` is the install compatibility gate, but users and maintainers need a clearer point-release verification statement than GNOME's major-version metadata can provide. Release documentation is also where future versions newer than 50.1 can be explicitly left unclaimed until separately tested.

**Alternatives considered**:

- Keep README as 46-49 after metadata changes: rejected because users would not see the requested compatibility update.
- Mention GNOME 50 support without verification status: rejected because the specification requires release readiness evidence.
