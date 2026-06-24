#!/usr/bin/env bash
# @ummat/brand — CI lint: block hardcoded hex values in app source files (B1-07)
#
# Scans all TypeScript/TSX/CSS files in the specified app directories for
# hardcoded hex color values that should instead use @ummat/brand CSS tokens.
#
# Allowed exceptions:
#   - Files inside @ummat/brand/src/ (the token definitions themselves)
#   - Files inside @ummat/ui/src/ (the component library)
#   - Comments (lines starting with // or *)
#   - Test fixtures (*.test.ts, *.spec.ts, *.stories.tsx)
#   - Files with the comment: /* hex-ok */
#
# Usage: ./check-hardcoded-hex.sh [dir1] [dir2] ...
# Returns exit code 1 if any hardcoded hex is found outside allowed locations.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAND_SRC="$(cd "$SCRIPT_DIR/.." && pwd)/src"
# Package now lives at packages/brand/scripts; UI lives at apps/ui (one extra ../ vs. old apps/brand/scripts layout)
UI_SRC="$(cd "$SCRIPT_DIR/../../../apps/ui" 2>/dev/null && pwd || echo "")/src"

# Hex pattern: #[0-9a-fA-F]{3,8} (matches #rgb, #rrggbb, #rrggbbaa)
HEX_PATTERN='#[0-9a-fA-F]{3,8}\b'

# Directories to scan — default to all app source dirs
SCAN_DIRS=("$@")
if [ ${#SCAN_DIRS[@]} -eq 0 ]; then
  # Default: scan all ummeco apps — ROOT = ummat/ monorepo root
  ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
  SCAN_DIRS=(
    "$ROOT/../praycalc/web/app"
    "$ROOT/../praycalc/web/components"
    "$ROOT/../islamwiki/web/app"
    "$ROOT/../islamwiki/web/components"
    "$ROOT/../chatislam/web/app"
    "$ROOT/../chatislam/web/components"
    "$ROOT/app/web/app"
    "$ROOT/app/web/components"
    "$ROOT/pro/web/src"
    "$ROOT/chat/web/app"
    "$ROOT/dev/developers/app"
  )
fi

FOUND=0
VIOLATIONS=()

for dir in "${SCAN_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    continue
  fi

  while IFS= read -r file; do
    # Skip token files and test files
    [[ "$file" == "$BRAND_SRC"/* ]] && continue
    [[ "$file" == "$UI_SRC"/* ]] && continue
    [[ "$file" == *.test.ts ]] && continue
    [[ "$file" == *.spec.ts ]] && continue
    [[ "$file" == *.stories.tsx ]] && continue

    # Skip files with explicit /* hex-ok */ annotation
    if grep -q '/\* hex-ok \*/' "$file" 2>/dev/null; then
      continue
    fi

    # Grep for hex values, excluding comment lines
    while IFS= read -r line; do
      lineno="${line%%:*}"
      content="${line#*:}"
      # Skip lines that are comments
      trimmed="${content#"${content%%[! ]*}"}"  # ltrim
      if [[ "$trimmed" == //* || "$trimmed" == \** || "$trimmed" == '#'* ]]; then
        continue
      fi
      FOUND=$((FOUND + 1))
      VIOLATIONS+=("$file:$lineno — $content")
    done < <(grep -n -E "$HEX_PATTERN" "$file" 2>/dev/null || true)
  done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) 2>/dev/null)
done

if [ $FOUND -gt 0 ]; then
  echo "❌ Hardcoded hex color violations found ($FOUND):"
  echo "   Use @ummat/brand CSS tokens instead (var(--brand-green-*), var(--color-*), etc.)"
  echo ""
  for v in "${VIOLATIONS[@]}"; do
    echo "  $v"
  done
  echo ""
  echo "To suppress a file intentionally: add /* hex-ok */ at the top."
  exit 1
else
  echo "✅ No hardcoded hex values found in scanned directories."
fi
