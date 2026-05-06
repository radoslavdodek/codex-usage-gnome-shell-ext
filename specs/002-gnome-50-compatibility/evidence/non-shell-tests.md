# Non-Shell Test Evidence

- shellVersion: all
  checkId: non-shell-tests
  status: pass
  date: 2026-05-06
  environment: `gjs 1.88.0`; local repository test harness
  evidence: Final `tests/run-tests.sh` run exited 0 with `formatter tests passed`, `balance source tests passed`, and `redaction tests passed`.
  notes: Output contains no credentials, tokens, account identifiers, authorization headers, cookies, or raw provider payloads.
  blockerReason:
