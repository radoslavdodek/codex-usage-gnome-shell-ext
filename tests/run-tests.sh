#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

SCHEMA_TMP=$(mktemp -d "${TMPDIR:-/tmp}/codex-usage-schemas.XXXXXX")
trap 'rm -rf "$SCHEMA_TMP"' EXIT
glib-compile-schemas --targetdir="$SCHEMA_TMP" schemas
export GSETTINGS_SCHEMA_DIR="$SCHEMA_TMP"

for test_file in tests/*.test.js; do
    gjs -m "$test_file"
done
