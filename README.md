# Codex Usage Indicator

Codex Usage Indicator is a GNOME Shell extension that shows your Codex Balance
usage in the top bar and details in a dropdown menu.

It supports GNOME Shell versions 46 to 50.

## Quick Start

1. Install the Codex CLI and confirm it works:

   ```sh
   codex --version
   ```

2. Sign in to Codex with ChatGPT authentication:

   ```sh
   codex login
   codex login status
   ```

   The extension uses Codex Balance data from your ChatGPT-authenticated Codex
   session. 

3. Install and enable the extension package:

   ```sh
   gnome-extensions install --force /path/to/codex-usage@rado.shell-extension.zip
   ```

   Reload GNOME Shell before enabling. On Xorg, press `Alt`+`F2`, type `r`, and
   press Enter. On Wayland, log out and back in.

   ```sh
   gnome-extensions enable codex-usage@rado
   ```

   If you are building the package from this source tree, see
   [TECHNICAL.md](TECHNICAL.md).

4. Look for the Codex Usage indicator in the top bar. Open its menu to see the
   5-hour and weekly usage buckets, freshness, state, manual refresh, refresh
   interval, and refresh pause controls.

## If Codex Is Not Found

GNOME Shell may not inherit your terminal `PATH`. If the indicator says Codex is
not configured, set the extension's Codex command to the absolute path printed
by:

```sh
command -v codex
```

You can set this in the extension preferences as **Codex Command**. For an
installed copy, you can also set it from a terminal:

```sh
EXTDIR="$HOME/.local/share/gnome-shell/extensions/codex-usage@rado"
GSETTINGS_SCHEMA_DIR="$EXTDIR/schemas" \
  gsettings set org.gnome.shell.extensions.codex-usage codex-command "/absolute/path/from/command-v-codex"
```

## Preferences

The extension defaults to the real Codex app-server source. The mock source is
included only for UI testing.

Available settings:

- Source: real Codex data or mock data.
- Codex command path, default `codex`.
- Refresh interval, default 5 minutes, configurable from 1 through 30 minutes.
- Refresh Pause. While active, automatic and manual refresh attempts are
  suppressed and the panel caption is exactly `Paused`.
- Provider timeout, default 15 seconds.
- Warning threshold, default 25%.
- Panel display format.
- Bucket priority: lowest remaining, 5-hour, or weekly.

The indicator menu also exposes Refresh Interval and Refresh Pause directly.

## Privacy

The extension does not collect telemetry and does not transmit Balance data to
third parties. It asks the local Codex CLI for usage data and does not read or
store Codex credentials, tokens, cookies, account identifiers, authorization
headers, or raw provider payloads.

Provider errors are redacted before they are shown in the UI.

## License

Codex Usage Indicator is licensed under the GNU Affero General Public License
version 3. See [LICENSE](LICENSE).

## Technical Details

Build instructions, local development setup, data-source internals, tests,
packaging notes, and release verification checks are documented in
[TECHNICAL.md](TECHNICAL.md).
