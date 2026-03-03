#!/usr/bin/env bash
# Shorebird one-shot setup for PrayCalc.
# Run in a real terminal (not Claude Code):
#   bash praycalc/flutter/scripts/shorebird-setup.sh
set -euo pipefail

export PATH="$HOME/.shorebird/bin:$PATH"

echo "=== Step 1: Shorebird Login ==="
shorebird login

echo ""
echo "=== Step 2: Initialize PrayCalc ==="
cd "$(dirname "$0")/.."
shorebird init --force

echo ""
echo "=== Step 3: Create CI Token ==="
echo "Creating CI token for GitHub Actions..."
TOKEN_OUTPUT=$(shorebird account token create --name github-ci 2>&1)
echo "$TOKEN_OUTPUT"

# Extract token value
SHOREBIRD_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -E '^\S+$' | tail -1)
if [ -z "$SHOREBIRD_TOKEN" ]; then
    echo ""
    echo "Could not auto-extract token. Copy the token above and run:"
    echo "  gh secret set SHOREBIRD_TOKEN --repo ummeco/ummat"
    exit 0
fi

echo ""
echo "=== Step 4: Set GitHub Secret ==="
echo "$SHOREBIRD_TOKEN" | gh secret set SHOREBIRD_TOKEN --repo ummeco/ummat
echo "SHOREBIRD_TOKEN secret set on ummeco/ummat."

echo ""
echo "=== Done! ==="
echo "Shorebird is ready. CI will auto-patch on push to main."
