# Technical Notes

This document contains implementation, development, packaging, testing, and
release-verification details for Codex Usage Indicator. The user-facing setup is
kept in [README.md](README.md).

## Data Source

The extension defaults to the real `codex-app-server` source and also ships with
a mock source for development. The real source uses the installed Codex CLI:

```sh
codex app-server --listen stdio://
```

The real source initializes the JSON-RPC app server, calls
`account/rateLimits/read`, reads the `codex` rate limit snapshot, and maps the
300-minute window to the 5-hour bucket and the 10080-minute window to the weekly
bucket. Percent remaining is normalized as `100 - usedPercent`.

The real source requires ChatGPT authentication through the Codex CLI and
rejects API-key authentication for this feature. It does not read or fall back
to `OPENAI_API_KEY`.

## Files

Runtime package files:

- `LICENSE`
- `extension.js`
- `metadata.json`
- `prefs.js`
- `stylesheet.css`
- `lib/*.js`
- `schemas/org.gnome.shell.extensions.codex-usage.gschema.xml`

Development-only files:

- `tests/`
- `specs/`
- `.specify/`
- `.agents/`

Generated files such as `schemas/gschemas.compiled`, archives, credentials,
tokens, raw provider payloads, and test artifacts should not be committed or
included in release packages.

## Build And Install Locally

Preferred flow:

```sh
mkdir -p /tmp/codex-usage-pack
gnome-extensions pack -f -o /tmp/codex-usage-pack \
  --extra-source=LICENSE \
  --extra-source=lib \
  --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml \
  .
gnome-extensions install --force /tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip
```

Then reload GNOME Shell before enabling. On Xorg, press `Alt`+`F2`, type `r`,
and press Enter. On Wayland, log out and back in.

```sh
gnome-extensions enable codex-usage@rado
```

When updating an already installed development build, reinstalling the zip and
running `gnome-extensions disable/enable` may still leave old imported modules
cached in GNOME Shell. Reload GNOME Shell after each code update before testing
the changed provider logic.

Manual-copy flow:

```sh
UUID=codex-usage@rado
TARGET="$HOME/.local/share/gnome-shell/extensions/$UUID"
mkdir -p "$TARGET/lib" "$TARGET/schemas"
cp extension.js metadata.json prefs.js stylesheet.css "$TARGET/"
cp lib/*.js "$TARGET/lib/"
cp schemas/*.xml "$TARGET/schemas/"
glib-compile-schemas "$TARGET/schemas"
```

After package install or manual copy, the running Shell process must discover
the new directory before `gnome-extensions enable "$UUID"` will work. On Xorg,
reload GNOME Shell with `Alt`+`F2`, then `r`, then Enter. On Wayland, log out
and back in. Then run:

```sh
gnome-extensions enable "$UUID"
```

## Configuration

Preferences are stored with GSettings under
`org.gnome.shell.extensions.codex-usage`:

- Source: mock data or Codex app-server.
- Mock scenario for local UI checks.
- Codex command path, default `codex`.
- Refresh interval, default 5 minutes, configurable from 1 through 30 whole
  minutes.
- Refresh Pause, default off. While active, automatic and manual refresh
  attempts are suppressed and the panel caption is exactly `Paused`.
- Provider timeout, default 15 seconds.
- Warning threshold, default 25%.
- Panel display format: bucket plus percent, percent only, or state label.
- Bucket priority: lowest remaining, 5-hour, or weekly.

Invalid values fall back to safe defaults.

The indicator menu also exposes refresh controls directly. Open the menu to use
the Refresh Interval submenu or the Refresh Pause switch without opening the
preferences window. Interval choices are shown as whole minutes and are stored
in GSettings as seconds.

GNOME Shell may not inherit your interactive shell `PATH`. If Codex is
installed through nvm, npm, pnpm, or another user-local toolchain, set the Codex
command to an absolute path:

```sh
command -v codex
EXTDIR="$HOME/.local/share/gnome-shell/extensions/codex-usage@rado"
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage codex-command "/absolute/path/from/command-v-codex"
```

For an already installed copy, switch to the real source with:

```sh
GSETTINGS_SCHEMA_DIR="$HOME/.local/share/gnome-shell/extensions/codex-usage@rado/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage source-kind codex-app-server
```

Use `source-kind mock` only for UI testing; it displays deterministic fixture
values such as `5h 87%`.

## Privacy And Redaction

The extension does not collect telemetry and does not transmit Balance data to
third parties.

Provider stdout, stderr, JSON-RPC errors, and thrown errors are redacted before
they are shown in UI state. Redaction covers authorization headers, cookies,
bearer tokens, token-like key/value pairs, account identifiers, email
addresses, high-entropy strings, and long raw payload fragments.

## Tests

Run the non-Shell test suite:

```sh
tests/run-tests.sh
```

The test harness compiles schemas and runs GJS tests for formatting,
normalization, source mapping, stale handling, auth-mode rejection, no-overlap
behavior, timeout/rate-limit classification, and redaction.

Run a live Codex app-server probe against your configured CLI:

```sh
CODEX_COMMAND="$(command -v codex)" gjs -m tests/liveCodexProbe.js
```

This command performs a real `account/rateLimits/read` request and prints only
normalized status and percentages.

## Package

Create a runtime-only extension archive:

```sh
mkdir -p /tmp/codex-usage-pack
gnome-extensions pack -f -o /tmp/codex-usage-pack \
  --extra-source=LICENSE \
  --extra-source=lib \
  --schema=schemas/org.gnome.shell.extensions.codex-usage.gschema.xml \
  .
```

The expected archive is
`/tmp/codex-usage-pack/codex-usage@rado.shell-extension.zip`.
