# Contract: Refresh Settings Schema

This contract defines the persistent settings changed by the menu refresh settings feature.

## Existing Key: `refresh-interval-seconds`

**Type**: integer  
**Default**: `300`  
**Valid range**: `60` through `1800`  
**User-facing unit**: whole minutes, `1` through `30`

**Rules**:

- The schema range MUST allow 1 minute and 30 minutes.
- The schema range MUST reject values below 60 seconds and above 1800 seconds.
- Runtime normalization MUST default non-finite or unreadable values to 300 seconds.
- Runtime normalization SHOULD clamp out-of-range numeric values to the nearest valid interval when handling values outside GSettings.
- `DEFAULT_CONFIG.refreshIntervalSeconds` MUST match the schema default.

## New Key: `refresh-paused`

**Type**: boolean  
**Default**: `false`  
**User-facing label**: Refresh Pause

**Rules**:

- `false` means automatic and manual refresh behavior is available.
- `true` means automatic and manual refresh attempts are suppressed and the top-bar caption is `Paused`.
- The setting MUST persist across menu reopen, extension disable/enable, and desktop session restart.
- The setting MUST be watched by the same settings change path used for other runtime configuration.

## Settings Normalization

`configFromSettings()` MUST expose:

- `refreshIntervalSeconds`
- `refreshPaused`

`connectSettings()` MUST subscribe to:

- `changed::refresh-interval-seconds`
- `changed::refresh-paused`

Invalid settings handling MUST NOT:

- crash GNOME Shell
- create duplicate timers
- hide menu refresh controls
- start refresh loops
- change source authentication or privacy behavior
