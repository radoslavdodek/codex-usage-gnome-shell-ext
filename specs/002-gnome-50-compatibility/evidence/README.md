# Compatibility Evidence Guidance

Evidence files in this directory are release artifacts for GNOME Shell 50.1 compatibility verification.

## Sanitization Rules

Do not record credentials, tokens, cookies, authorization headers, account identifiers, email addresses, raw provider payloads, full JSON-RPC responses, or local personal data. Prefer concise command output, Shell/tool versions, package paths, and manual observations.

## Status Values

- `pass`: The check was executed and met the expected result.
- `fail`: The check was executed and did not meet the expected result.
- `blocked`: The check could not be executed; include the reason.

## Evidence Template

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

Use the required check IDs from `../contracts/verification-record.md`.
