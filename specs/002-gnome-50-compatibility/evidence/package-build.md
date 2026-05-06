# Package Build Evidence

- shellVersion: all
  checkId: package-build
  status: pass
  date: 2026-05-06
  environment: `gnome-extensions` 50.1
  evidence: Final `gnome-extensions pack -f -o /tmp/codex-usage-pack --extra-source=lib --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml .` run exited 0 and created `/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip` with SHA-256 `66a1346b6380999f28039e6927640887f44aa390e933e61ab6ffec540bdda388`.
  notes: Package path is outside the repository under `/tmp/codex-usage-pack`.
  blockerReason:
