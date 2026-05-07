# Evidence Guidance: Menu Refresh Settings

Use this directory only for sanitized verification notes and screenshots.

Do record:

- GNOME Shell version and session type.
- Extension package path or installed extension directory.
- Menu control labels and selected refresh interval values.
- Whether the panel caption is exactly `Paused`.
- Whether automatic/manual refresh attempts were suppressed while paused.
- Lifecycle observations such as duplicate indicator, timer, signal, or provider activity counts.

Do not record:

- Credentials, tokens, cookies, authorization headers, or API keys.
- Account identifiers, email addresses, workspace identifiers, or raw provider payloads.
- Full Codex app-server stdout/stderr or unredacted JSON-RPC messages.
- Screenshots that show private account data outside the extension menu.

If provider output or an error message is relevant, record only the redacted user-facing text shown by the extension.

