# Quickstart: Menu Refresh Settings

## Non-Shell Checks

Run the existing test suite after implementation:

```sh
tests/run-tests.sh
```

Expected additions:

- Settings normalization accepts 60, 300, and 1800 seconds.
- User-facing minute conversion displays 1, 5, and 30 minutes.
- Out-of-range numeric interval inputs are rejected by schema or normalized safely.
- `refresh-paused` defaults to false and is read into runtime config.
- Pause helpers suppress manual and automatic refresh starts while active.

## Local Install

Package and install the extension:

```sh
mkdir -p /tmp/codex-usage-pack
gnome-extensions pack -f -o /tmp/codex-usage-pack \
  --extra-source=lib \
  --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml \
  .
gnome-extensions install --force /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip
```

Reload GNOME Shell before enabling. On Xorg, press `Alt`+`F2`, type `r`, and press Enter. On Wayland, log out and back in.

```sh
gnome-extensions enable codex-usage@rado
```

## Manual Verification

Verify the menu controls in a live GNOME Shell session:

- Open the indicator menu during initial loading; the Refresh Interval submenu and Refresh Pause switch are visible.
- Open Refresh Interval and set it to 1 minute; reopen the menu and verify it remains selected.
- Open Refresh Interval and set it to 5 minutes; verify the default/current value displays correctly.
- Open Refresh Interval and set it to 30 minutes; reopen the menu and verify it remains selected.
- Attempt values below 1 minute and above 30 minutes through direct settings writes; the extension does not crash or hide controls.
- Enable Refresh Pause; the top-bar caption changes to exactly `Paused`.
- Wait through at least one configured interval while paused; no loading or refreshing caption appears.
- Activate manual refresh while paused; no usage refresh starts and `Paused` remains visible.
- Disable Refresh Pause; refresh behavior resumes using the selected interval.
- Repeat the checks while mock source states are loading, normal, stale, unavailable, rate-limited, malformed/error, not authenticated, and not configured.
- Run at least 10 enable/disable cycles; no duplicate indicators, timers, menu rows, settings signals, or provider refreshes remain.

## Direct Settings Smoke Commands

For an installed development copy:

```sh
EXTDIR="$HOME/.local/share/gnome-shell/extensions/codex-usage@rado"
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage refresh-interval-seconds 60
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage refresh-paused true
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage refresh-paused false
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage refresh-interval-seconds 1800
```

The menu should reflect each settings change without disabling or reloading the extension.
