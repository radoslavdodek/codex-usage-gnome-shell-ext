# Data Model: Top-bar Codex Balance Usage Indicator

## CodexBalanceSnapshot

Represents one normalized view of Codex Balance.

**Fields**:

- `schemaVersion`: integer, starts at `1`
- `sourceId`: stable provider identifier, for example `mock` or `codex-app-server`
- `sourceAuth`: `SourceAuthContext`
- `overallStatus`: `loading`, `normal`, `warning`, `limit-reached`, `stale`, `not-authenticated`, `not-configured`, or `error`
- `displayText`: compact top-bar text derived from the selected display format
- `detailText`: concise menu summary for current state
- `fiveHour`: `BalanceBucket`
- `weekly`: `BalanceBucket`
- `lastSuccessfulUpdateUnix`: integer Unix timestamp in seconds, nullable
- `generatedAtUnix`: integer Unix timestamp in seconds
- `staleAfterUnix`: integer Unix timestamp in seconds, nullable
- `errorMessage`: sanitized string, nullable
- `rawErrorKind`: internal enum for provider handling, never displayed without sanitization

**Validation rules**:

- Snapshot must contain both `fiveHour` and `weekly` bucket keys, even when a bucket is unavailable.
- Real-source snapshots must declare `sourceAuth.mode` as `chatgpt` and `sourceAuth.apiKeyUsed` as `false`.
- `overallStatus` must be derived from provider state and available bucket statuses.
- `displayText` must be compact and must not include raw provider payloads.
- `errorMessage` must be sanitized before assignment.
- `lastSuccessfulUpdateUnix` is updated only after a valid successful snapshot.
- A previously successful snapshot becomes stale when current time is greater than `lastSuccessfulUpdateUnix + (2 * refreshIntervalSeconds)`.

## SourceAuthContext

Represents non-secret metadata about how Codex usage was authenticated.

**Fields**:

- `mode`: `chatgpt`, `api-key`, `missing`, or `unknown`
- `apiKeyUsed`: boolean
- `credentialLocation`: `codex-file`, `codex-keyring`, `helper-managed`, or `unknown`
- `workspaceSelection`: `default-context`
- `message`: sanitized string, nullable

**Validation rules**:

- The real provider accepts only `mode: chatgpt` with `apiKeyUsed: false`.
- `api-key`, `missing`, or `unknown` authentication maps to `not-authenticated` or `not-configured` with a sanitized actionable message.
- `credentialLocation` must not include a path containing usernames, account identifiers, token names, token values, or raw payload fragments.
- Workspace/account identifiers must not be included; first release uses the selected source's default authenticated context.

## BalanceBucket

Represents one Balance usage bucket shown in the menu.

**Fields**:

- `key`: `five-hour` or `weekly`
- `label`: display label, default `5-hour usage limit` or `Weekly usage limit`
- `percentRemaining`: number from 0 through 100, nullable
- `resetAtUnix`: integer Unix timestamp in seconds, nullable
- `resetText`: provider fallback reset text, nullable
- `status`: `normal`, `warning`, `limit-reached`, `stale`, `unavailable`, or `error`
- `message`: sanitized bucket-level message, nullable

**Validation rules**:

- `percentRemaining` must be numeric and clamped/rejected according to provider contract; invalid values produce `error` for that bucket.
- `0` maps to `limit-reached`.
- `1` through warning threshold maps to `warning`.
- Values above warning threshold map to `normal`.
- Missing bucket data maps to `unavailable` unless provider state is a broader authentication/configuration/error state.
- Parseable reset times display in local timezone; unparseable reset data may remain in `resetText`.

## DataSourceConfig

Represents source-specific configuration and safe polling settings.

**Fields**:

- `sourceKind`: `mock`, `codex-app-server`, or future provider key
- `codexCommand`: command path for the Codex CLI executable, nullable
- `refreshIntervalSeconds`: integer
- `timeoutSeconds`: integer
- `warningThresholdPercent`: integer from 1 through 99
- `bucketPriority`: `lowest`, `five-hour`, or `weekly`
- `displayFormat`: `bucket-percent`, `percent-only`, or `state-label`
- `requireChatGptAuth`: boolean, defaults to `true` for any real provider
- `allowApiKeyAuth`: boolean, defaults to `false`

**Validation rules**:

- `refreshIntervalSeconds` defaults to 300 and must be at least 300; invalid values fall back to the implementation default.
- `timeoutSeconds` defaults to 15 and must be shorter than refresh interval.
- `warningThresholdPercent` defaults to 25.
- `codexCommand` defaults to `codex` and is required for `codex-app-server`.
- `codex-app-server` must call JSON-RPC `account/rateLimits/read` and normalize the `codex` rate-limit snapshot.
- `codex-app-server` must reject API-key auth even if `OPENAI_API_KEY` is present in the environment.
- Invalid `sourceKind` produces `not-configured`.

## RefreshState

Tracks refresh lifecycle independent of UI rendering.

**States**:

- `idle`: no refresh in progress
- `loading`: initial refresh in progress with no previous success
- `refreshing`: refresh in progress with previous data available
- `successful`: latest refresh produced a valid snapshot
- `failed-with-previous`: latest refresh failed while preserving prior snapshot
- `not-authenticated`: provider requires authentication
- `wrong-auth-mode`: provider found API-key or unknown auth where ChatGPT auth is required
- `not-configured`: provider configuration is missing or invalid
- `rate-limited`: provider refused refresh due to rate limiting
- `timed-out`: provider exceeded timeout
- `malformed`: provider returned invalid data
- `canceled`: refresh was canceled during disable/reload

**Transitions**:

- `idle` -> `loading` on first refresh.
- `successful` -> `refreshing` on later refresh.
- `refreshing` -> `successful` when valid data arrives.
- `refreshing` -> `failed-with-previous` when refresh fails and a previous snapshot exists.
- Any active state -> `canceled` during disable.
- Any failure state with previous successful data can derive a `stale` snapshot.
- `wrong-auth-mode` maps to a user-visible `not-authenticated` or `not-configured` state with a sanitized message instructing ChatGPT login.

## DisplayPreference

Controls presentation without changing the normalized source data.

**Fields**:

- `displayFormat`: selected compact top-bar text format
- `bucketPriority`: selected bucket priority mode
- `warningThresholdPercent`: status threshold

**Validation rules**:

- Unknown display formats fall back to `bucket-percent`.
- Unknown bucket priority falls back to `lowest`.
- Threshold outside 1-99 falls back to 25.
