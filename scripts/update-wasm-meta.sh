#!/bin/bash
WASM_FILE="src/wasm/bach.wasm"
BACH_JS_FILE="src/wasm/bach.js"
INDEX_JS_FILE="src/wasm/index.js"
META_FILE="src/wasm/meta.json"
BACH_DIR="../midi-sketch-bach"

file_size() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    stat -f%z "$1"
  else
    stat -c%s "$1"
  fi
}

file_md5() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    md5 -q "$1"
  else
    md5sum "$1" | cut -d' ' -f1
  fi
}

gzip_size() {
  gzip -c "$1" | wc -c | tr -d '[:space:]'
}

if [ ! -f "$WASM_FILE" ]; then
  echo "❌ WASM file not found: $WASM_FILE"
  exit 1
fi

for REQUIRED_FILE in "$BACH_JS_FILE" "$INDEX_JS_FILE"; do
  if [ ! -f "$REQUIRED_FILE" ]; then
    echo "❌ Asset file not found: $REQUIRED_FILE"
    exit 1
  fi
done

SIZE=$(file_size "$WASM_FILE")
MD5=$(file_md5 "$WASM_FILE")
SIZE_KB=$((SIZE / 1024))
GZIP_SIZE=$(gzip_size "$WASM_FILE")
GZIP_KB=$((GZIP_SIZE / 1024))

BACH_JS_SIZE=$(file_size "$BACH_JS_FILE")
BACH_JS_SIZE_KB=$((BACH_JS_SIZE / 1024))
BACH_JS_GZIP_SIZE=$(gzip_size "$BACH_JS_FILE")
BACH_JS_GZIP_KB=$((BACH_JS_GZIP_SIZE / 1024))

INDEX_JS_SIZE=$(file_size "$INDEX_JS_FILE")
INDEX_JS_SIZE_KB=$((INDEX_JS_SIZE / 1024))
INDEX_JS_GZIP_SIZE=$(gzip_size "$INDEX_JS_FILE")
INDEX_JS_GZIP_KB=$((INDEX_JS_GZIP_SIZE / 1024))

TOTAL_SIZE=$((BACH_JS_SIZE + INDEX_JS_SIZE + SIZE))
TOTAL_SIZE_KB=$((TOTAL_SIZE / 1024))
TOTAL_GZIP_SIZE=$((BACH_JS_GZIP_SIZE + INDEX_JS_GZIP_SIZE + GZIP_SIZE))
TOTAL_GZIP_KB=$((TOTAL_GZIP_SIZE / 1024))

# Engine provenance from the midi-sketch-bach repo
ENGINE_VERSION="unknown"
ENGINE_PKG="$BACH_DIR/package.json"
if [ -f "$ENGINE_PKG" ]; then
  ENGINE_VERSION=$(sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$ENGINE_PKG" | head -1)
  [ -z "$ENGINE_VERSION" ] && ENGINE_VERSION="unknown"
fi

ENGINE_COMMIT="unknown"
if [ -d "$BACH_DIR/.git" ]; then
  ENGINE_COMMIT=$(git -C "$BACH_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
fi

UPDATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat > "$META_FILE" << EOF
{
  "wasmSize": $SIZE,
  "wasmSizeKB": $SIZE_KB,
  "gzipSize": $GZIP_SIZE,
  "gzipKB": $GZIP_KB,
  "assets": {
    "bach.js": {
      "size": $BACH_JS_SIZE,
      "sizeKB": $BACH_JS_SIZE_KB,
      "gzipSize": $BACH_JS_GZIP_SIZE,
      "gzipKB": $BACH_JS_GZIP_KB
    },
    "index.js": {
      "size": $INDEX_JS_SIZE,
      "sizeKB": $INDEX_JS_SIZE_KB,
      "gzipSize": $INDEX_JS_GZIP_SIZE,
      "gzipKB": $INDEX_JS_GZIP_KB
    },
    "bach.wasm": {
      "size": $SIZE,
      "sizeKB": $SIZE_KB,
      "gzipSize": $GZIP_SIZE,
      "gzipKB": $GZIP_KB
    }
  },
  "total": {
    "size": $TOTAL_SIZE,
    "sizeKB": $TOTAL_SIZE_KB,
    "gzipSize": $TOTAL_GZIP_SIZE,
    "gzipKB": $TOTAL_GZIP_KB
  },
  "md5": "$MD5",
  "engineVersion": "$ENGINE_VERSION",
  "engineCommit": "$ENGINE_COMMIT",
  "updatedAt": "$UPDATED_AT"
}
EOF

echo "📦 Updated $META_FILE"
echo "   Engine: v$ENGINE_VERSION ($ENGINE_COMMIT)"
echo "   WASM: ${SIZE_KB}KB (${GZIP_KB}KB gzipped)"
echo "   Total assets: ${TOTAL_SIZE_KB}KB (${TOTAL_GZIP_KB}KB gzipped)"
echo "   MD5: $MD5"
