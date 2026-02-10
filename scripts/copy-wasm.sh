#!/bin/bash
set -e

BACH_DIR="../midi-sketch-bach"
DIST_DIR="$BACH_DIR/dist"
DEST_DIR="src/wasm"

WASM_FILES=("bach.wasm" "bach.js")
JS_FILES=("index.mjs" "index.d.ts")

echo "📦 Copying WASM files from midi-sketch-bach..."

if [ ! -d "$BACH_DIR" ]; then
  echo "❌ Error: midi-sketch-bach directory not found at $BACH_DIR"
  echo "   Please clone midi-sketch-bach in the parent directory."
  exit 1
fi

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

# Ensure destination directory exists
mkdir -p "$DEST_DIR"

# Copy files
echo "   Copying WASM files..."
for file in "${WASM_FILES[@]}"; do
  cp "$DIST_DIR/$file" "$DEST_DIR/"
  echo "   ✓ $file"
done

echo "   Copying JS API files..."
for file in "${JS_FILES[@]}"; do
  cp "$DIST_DIR/$file" "$DEST_DIR/"
  echo "   ✓ $file"
done

# Rename index.mjs to index.js
if [ -f "$DEST_DIR/index.mjs" ]; then
  mv "$DEST_DIR/index.mjs" "$DEST_DIR/index.js"
  echo "   ✓ Renamed index.mjs → index.js"
fi

# Remove sourceMappingURL from index.js
if [ -f "$DEST_DIR/index.js" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' '/^\/\/# sourceMappingURL=/d' "$DEST_DIR/index.js"
  else
    sed -i '/^\/\/# sourceMappingURL=/d' "$DEST_DIR/index.js"
  fi
fi

# Generate meta.json with WASM file info
WASM_SIZE=$(wc -c < "$DEST_DIR/bach.wasm" | tr -d ' ')
WASM_MD5=$(md5 -q "$DEST_DIR/bach.wasm" 2>/dev/null || md5sum "$DEST_DIR/bach.wasm" | cut -d' ' -f1)
cat > "$DEST_DIR/meta.json" << EOF
{
  "wasmSize": $WASM_SIZE,
  "md5": "$WASM_MD5",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "   ✓ Generated meta.json"

echo ""
echo "✅ WASM files copied successfully!"
