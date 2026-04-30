#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

SCHEMA_TMP=$(mktemp -d "${TMPDIR:-/tmp}/codex-usage-schemas.XXXXXX")
trap 'rm -rf "$SCHEMA_TMP"' EXIT
glib-compile-schemas --targetdir="$SCHEMA_TMP" schemas

gjs -m tests/formatter.test.js
gjs -m tests/balanceSource.test.js
gjs -m tests/redaction.test.js
