# GNOME Shell 50.1 Full Compatibility Evidence

- shellVersion: 50.1
  checkId: install
  status: pass
  date: 2026-05-06
  environment: `GNOME Shell 50.1`; `gnome-extensions` 50.1; isolated `/tmp/codex-usage-xdg` XDG home
  evidence: `gnome-extensions install --print-uuid /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip` exited 0 and printed `codex-usage@rado`; installed `metadata.json` retained `["46","47","48","49","50"]`.
  notes: The isolated XDG home prevented changes to the user's live extension installation.
  blockerReason:

- shellVersion: 50.1
  checkId: enable-single-indicator, normal-display, loading-state, failed-refresh, stale-data, manual-refresh, safe-error-display, disable-cleanup, shell-reload, enable-disable-10-cycles
  status: blocked
  date: 2026-05-06
  environment: local GNOME Shell 50.1; attempted `dbus-run-session -- gnome-shell-test-tool --headless --disable-animations --extension /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`
  evidence: Headless Shell launched under an isolated DBus session, but the automation did not complete in this workspace and was stopped after cleanup. No panel or dropdown UI observation was possible from Codex.
  notes: No runtime code patch was made from this blocked row because no extension API failure or user-visible regression was observed.
  blockerReason: Manual top-bar/dropdown observation or a completing GNOME Shell 50.1 automation run is required for the remaining full compatibility checks.
