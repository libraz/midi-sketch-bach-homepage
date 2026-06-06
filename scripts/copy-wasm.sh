#!/bin/bash
set -e

BACH_DIR="../midi-sketch-bach"
DIST_DIR="$BACH_DIR/dist"
DEST_DIR="src/wasm"

# Required files from dist/
WASM_FILES=("bach.wasm" "bach.js")
JS_FILES=("index.mjs" "index.d.ts")

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

# Rename index.mjs to index.js (used as index.js in imports)
if [ -f "$DEST_DIR/index.mjs" ]; then
  mv "$DEST_DIR/index.mjs" "$DEST_DIR/index.js"
  echo "   ✓ Renamed index.mjs → index.js"
fi

# Remove sourceMappingURL comments (source maps are not shipped)
for file in "$DEST_DIR/index.js" "$DEST_DIR/index.d.ts"; do
  if [ -f "$file" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS (BSD sed requires '' after -i)
      sed -i '' '/^\/\/# sourceMappingURL=/d' "$file"
    else
      # Linux (GNU sed)
      sed -i '/^\/\/# sourceMappingURL=/d' "$file"
    fi
  fi
done

# Update meta.json
echo ""
./scripts/update-wasm-meta.sh

echo ""
echo "✅ WASM files copied successfully!"
