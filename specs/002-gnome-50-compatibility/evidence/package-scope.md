# Package Scope Evidence

- shellVersion: all
  checkId: package-scope
  status: pass
  date: 2026-05-06
  environment: `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`; inspected with `unzip -Z1`
  evidence: Archive contains only `extension.js`, `metadata.json`, `prefs.js`, `stylesheet.css`, `lib/balanceSource.js`, `lib/codexAppServerSource.js`, `lib/compatibility.js`, `lib/formatter.js`, `lib/mockSource.js`, `lib/model.js`, `lib/redaction.js`, `lib/settings.js`, and `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`.
  notes: Archive does not contain `tests/`, `specs/`, `.specify/`, `.agents/`, `.git/`, `.codex`, `schemas/gschemas.compiled`, extension archives, logs, credentials, tokens, cookies, authorization headers, account identifiers, or raw provider payloads. Packaged `metadata.json` has `shell-version` `["46", "47", "48", "49", "50"]`.
  blockerReason:
