#!/bin/bash
set -e

BACH_DIR="../midi-sketch-bach"
DIST_DIR="$BACH_DIR/dist"
DEST_DIR="src/wasm"

# Required files from dist/
WASM_FILES=("bach.wasm" "bach.js")
JS_FILES=("index.mjs" "index.d.ts")

file_md5() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    md5 -q "$1"
  else
    md5sum "$1" | cut -d' ' -f1
  fi
}

# MD5 of a JS/TS file with sourceMappingURL comments stripped
# (matches what copy_js_api writes to DEST_DIR)
stripped_md5() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed '/^\/\/# sourceMappingURL=/d' "$1" | md5 -q
  else
    sed '/^\/\/# sourceMappingURL=/d' "$1" | md5sum | cut -d' ' -f1
  fi
}

echo "📦 Copying WASM files from midi-sketch-bach..."

# Check if midi-sketch-bach directory exists
if [ ! -d "$BACH_DIR" ]; then
  echo "❌ Error: midi-sketch-bach directory not found at $BACH_DIR"
  echo "   Please clone midi-sketch-bach in the parent directory."
  exit 1
fi

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: dist directory not found at $DIST_DIR"
  echo "   Run 'yarn build' in midi-sketch-bach first."
  exit 1
fi

# Check WASM files
missing_wasm=()
for file in "${WASM_FILES[@]}"; do
  if [ ! -f "$DIST_DIR/$file" ]; then
    missing_wasm+=("$file")
  fi
done

if [ ${#missing_wasm[@]} -gt 0 ]; then
  echo "❌ Error: WASM files missing in $DIST_DIR:"
  for file in "${missing_wasm[@]}"; do
    echo "   - $file"
  done
  echo ""
  echo "   Run 'yarn build:wasm' in midi-sketch-bach first."
  exit 1
fi

# Check JS API files
missing_js=()
for file in "${JS_FILES[@]}"; do
  if [ ! -f "$DIST_DIR/$file" ]; then
    missing_js+=("$file")
  fi
done

if [ ${#missing_js[@]} -gt 0 ]; then
  echo "❌ Error: JS API files missing in $DIST_DIR:"
  for file in "${missing_js[@]}"; do
    echo "   - $file"
  done
  echo ""
  echo "   Run 'yarn build:js' in midi-sketch-bach first."
  echo "   (or 'yarn build' to build both WASM and JS)"
  exit 1
fi

mkdir -p "$DEST_DIR"

copied=0

# Copy binary/Emscripten files verbatim, skipping unchanged ones
echo "   Copying WASM files..."
for file in "${WASM_FILES[@]}"; do
  if [ -f "$DEST_DIR/$file" ] && [ "$(file_md5 "$DIST_DIR/$file")" = "$(file_md5 "$DEST_DIR/$file")" ]; then
    echo "   − $file (unchanged, skipped)"
  else
    cp "$DIST_DIR/$file" "$DEST_DIR/"
    echo "   ✓ $file"
    copied=$((copied + 1))
  fi
done

# Copy a JS API file, renaming and stripping sourceMappingURL comments
# (source maps are not shipped); skips when the stripped content matches
copy_js_api() {
  local src="$1" dest="$2"
  if [ -f "$DEST_DIR/$dest" ] && [ "$(stripped_md5 "$DIST_DIR/$src")" = "$(file_md5 "$DEST_DIR/$dest")" ]; then
    echo "   − $dest (unchanged, skipped)"
  else
    sed '/^\/\/# sourceMappingURL=/d' "$DIST_DIR/$src" > "$DEST_DIR/$dest"
    echo "   ✓ $src → $dest"
    copied=$((copied + 1))
  fi
}

echo "   Copying JS API files..."
copy_js_api "index.mjs" "index.js"  # imported as index.js
copy_js_api "index.d.ts" "index.d.ts"

if [ "$copied" -eq 0 ]; then
  echo ""
  echo "✅ All WASM files are up to date — nothing copied."
  exit 0
fi

# Update meta.json
echo ""
./scripts/update-wasm-meta.sh

echo ""
echo "✅ WASM files copied successfully! ($copied file(s) updated)"
