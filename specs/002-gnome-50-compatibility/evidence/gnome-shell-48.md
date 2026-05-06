# GNOME Shell 48 Regression Smoke Evidence

- shellVersion: 48
  checkId: install, enable-single-indicator, normal-display, manual-refresh, disable-cleanup, shell-reload
  status: blocked
  date: 2026-05-06
  environment: GNOME Shell 48 live environment unavailable in this workspace
  evidence: Local tooling reports `gnome-shell --version` as `GNOME Shell 50.1`; no GNOME Shell 48 VM, container, or session was available.
  notes: No runtime code patch was made from this blocked row because no regression symptom was observed.
  blockerReason: Matching GNOME Shell 48 environment is required for this regression smoke checklist.
