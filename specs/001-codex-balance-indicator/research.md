# Research: Top-bar Codex Balance Usage Indicator

## ChatGPT-Authenticated Codex Usage Source

**Decision**: Implement usage acquisition behind a replaceable `BalanceSource` interface, ship a mock provider for development and tests, and make the real first-release source the installed Codex CLI app-server protocol using Codex's ChatGPT login context. The provider spawns `codex app-server --listen stdio://`, sends JSON-RPC `initialize`, then calls `account/rateLimits/read`. It reads `GetAccountRateLimitsResponse.rateLimitsByLimitId.codex` when present, otherwise `rateLimits` only when `limitId` is `codex`. The source must verify `auth_mode` is `chatgpt`, must reject API-key authentication, and must never read or fall back to `OPENAI_API_KEY`.

**Rationale**: The feature requirement is specifically current Codex usage data and limits for a Codex session authenticated with ChatGPT login, not platform API-key usage. Official Codex authentication docs describe ChatGPT sign-in and API-key sign-in as separate modes, with ChatGPT sign-in used for subscription access and API keys used for usage-based access. Official pricing docs point users to the Codex usage dashboard for current limits and mention `/status` during an active CLI session. The generated Codex app-server protocol for local Codex CLI `0.125.0` exposes `account/rateLimits/read`, and a sanitized live probe with ChatGPT login confirmed that it returns the needed Codex rate-limit windows without requiring the GNOME extension to handle tokens directly.

**Feasibility test**:

- Date: 2026-04-30
- Local CLI: `codex-cli 0.125.0`
- Auth check: `codex login status` reported ChatGPT login.
- Probe: spawned `codex app-server --listen stdio://`, sent JSON-RPC `initialize`, then `account/rateLimits/read`.
- Result shape: response contained `rateLimits` and `rateLimitsByLimitId`; `rateLimitsByLimitId` contained `codex`.
- Codex snapshot shape: `limitId`, `limitName`, `primary`, `secondary`, `credits`, `planType`, and `rateLimitReachedType`.
- Window proof: `primary.windowDurationMins` was `300` and `secondary.windowDurationMins` was `10080`; both windows had numeric `usedPercent` and reset timestamps.
- Mapping: primary window maps to the 5-hour bucket; secondary window maps to the weekly bucket; percent remaining is `100 - usedPercent`.

**Alternatives considered**:

- Use `OPENAI_API_KEY` or API billing data: rejected because it is explicitly the wrong authentication mode and does not represent ChatGPT-plan Codex Balance.
- Have the GNOME extension parse `~/.codex/auth.json` directly and call `https://chatgpt.com/backend-api/wham/usage` itself: rejected because the auth file contains tokens and should be treated like a password; using Codex app-server keeps token refresh and request details inside the Codex CLI.
- Hardcode a scraper for the ChatGPT web page: rejected for first plan baseline because authenticated web-page structure can change, may require cookies/session handling, and increases privacy risk.
- Use a top-level `codex usage` command: rejected because local CLI help did not show such a command; the verified app-server method is the concrete non-interactive path.
- Implement mock-only first release: useful for development but rejected as release-complete behavior by FR-024.

**Sources checked**:

- OpenAI Codex authentication docs: `https://developers.openai.com/codex/auth`
- OpenAI Codex pricing/limits docs: `https://developers.openai.com/codex/pricing`
- OpenAI Help, Codex with ChatGPT plan: `https://help.openai.com/en/articles/11369540-codex-in-chatgpt`

## Default Polling and Timeout

**Decision**: Default automatic refresh interval is 5 minutes, minimum configurable interval is 5 minutes, and provider refresh timeout is 15 seconds. Data becomes stale after 2x the configured refresh interval without a successful refresh.

**Rationale**: Balance data is useful when reasonably fresh but does not need aggressive polling. A 5-minute default matches the current GSettings schema and keeps stale detection predictable. The 15-second timeout prevents hung provider work from making the extension appear permanently loading.

**Alternatives considered**:

- Refresh every minute: rejected as too aggressive for a desktop panel extension and likely source-hostile.
- Refresh only manually: rejected because stale top-bar state would be easy to miss.
- Longer timeout: rejected because Shell UI should recover quickly from provider failures.

## Provider Execution Model

**Decision**: Provider refreshes must be asynchronous or subprocess-backed with `Gio.Subprocess`/GLib async APIs, cancellable cleanup, non-overlap protection, and sanitized errors. No provider work may run before `enable()`, and provider cleanup must be called from `disable()`.

**Rationale**: GNOME Shell extensions run in the Shell process; blocking I/O or uncanceled subprocesses can destabilize the desktop. A small provider interface lets risky source code be isolated from rendering.

**Alternatives considered**:

- Synchronous file/network reads from menu callbacks: rejected because they can block GNOME Shell.
- Global singleton provider loaded at module import: rejected because it risks work before `enable()` and complicates cleanup.

## Normalized Status Mapping

**Decision**: Normalize all source data to two buckets, `fiveHour` and `weekly`, and derive the overall panel state from the available bucket with the lower remaining percent by default. Status thresholds are normal above 25%, warning from 1% through 25%, and limit reached at 0%, unless overridden by a valid preference.

**Rationale**: The user needs the most constrained Balance state at a glance, while the menu preserves full details. Thresholds match the feature specification and keep the panel calm during normal usage.

**Alternatives considered**:

- Always prioritize 5-hour bucket: rejected as default because weekly can become the real constraint.
- Display both percentages in the panel: rejected because it makes the top-bar item less glanceable.

## Reset-Time Formatting

**Decision**: Store reset time internally as an ISO timestamp when parseable and display it using GNOME/system locale formatting in the user's local timezone. Preserve provider-supplied reset text as fallback when a timestamp cannot be parsed.

**Rationale**: The spec requires local timezone display for parseable times, but source data may be relative, localized, or incomplete. Keeping fallback text avoids hiding useful information.

**Alternatives considered**:

- Require parseable absolute times: rejected because source output may not guarantee that format.
- Display provider text only: rejected because it may use a different timezone or locale when parseable data is available.

## Preferences Scope

**Decision**: First-release preferences are limited to refresh interval, warning threshold, display format, bucket priority, source kind, and optional Codex command path for the app-server provider. Defaults must work with mock development data and fail clearly when Codex is missing, not executable, not authenticated with ChatGPT, or authenticated with an API key.

**Rationale**: These settings directly affect safe polling, useful display, or provider configuration. More preferences would add surface area without solving first-release requirements.

**Alternatives considered**:

- No preferences: rejected because a real source may need a configured local helper path and users need safe refresh control.
- Full account/workspace selection: rejected as out of scope; the source's default authenticated context is used.

## Redaction

**Decision**: Route every provider error and diagnostic string through a redaction helper before UI display or logging. Redact authorization headers, cookies, bearer tokens, session/token-like key-value pairs, account/user identifiers where recognizable, long high-entropy strings, and raw source payload fragments.

**Rationale**: Source failures may include sensitive request headers, raw payload fragments, or account context. Safe bug-report logs are a constitutional requirement.

**Alternatives considered**:

- Trust provider implementations to sanitize individually: rejected because one central helper is easier to test and audit.

## Testing Strategy

**Decision**: Use non-Shell GJS tests for pure logic and provider contract validation, plus a manual Shell checklist for lifecycle, panel/menu UI, and compatibility with GNOME Shell 46-49.

**Rationale**: Parsing, status mapping, freshness, formatting, and redaction should be fast to verify outside a live Shell session, while lifecycle behavior still needs manual GNOME Shell verification.

**Alternatives considered**:

- Manual-only verification: rejected because parsing and redaction regressions need repeatable tests.
- Full Shell automation first: deferred because first release can get most risk reduction from pure tests and a manual Shell matrix.
