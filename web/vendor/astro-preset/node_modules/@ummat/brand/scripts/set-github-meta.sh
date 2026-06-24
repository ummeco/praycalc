#!/usr/bin/env bash
# FILE: packages/brand/scripts/set-github-meta.sh
# PURPOSE: Set GitHub topics for public Ummeco repos for discoverability + ASO.
# INVARIANTS:
#   - Public repos only: islamwiki, praycalc, chatislam (flock + ummat are private).
#   - Topics spec per T-P7-C-S10-T13; must match ASO keyword strategy.
#   - Uses `gh` CLI (already authenticated via gh auth login).
#   - Idempotent: re-running overwrites topics with canonical values.
#   - Social preview images must be set manually via GitHub repo settings
#     (requires OG image assets from T-P7-C-S10-T04).
# DO NOT: apply to private repos; change topics without updating ASO docs.
# REF: T-P7-C-S10-T13

set -euo pipefail

if ! command -v gh &>/dev/null; then
  echo "ERROR: gh CLI not found. Install via: brew install gh" >&2
  exit 1
fi

ORG="ummeco"

echo "Setting GitHub topics for public ${ORG} repos..."

# praycalc
gh api -X PUT "repos/${ORG}/praycalc/topics" \
  -f 'names[]=prayer-times' -f 'names[]=islamic' -f 'names[]=muslim' \
  -f 'names[]=pwa' -f 'names[]=flutter' -f 'names[]=hijri' \
  -f 'names[]=adhan' -f 'names[]=qibla' \
  --jq '.names | @csv' | sed 's/"//g' | xargs -I{} echo "  praycalc: [{}]"

# islamwiki
gh api -X PUT "repos/${ORG}/islamwiki/topics" \
  -f 'names[]=islamic-knowledge' -f 'names[]=wiki' -f 'names[]=quran' \
  -f 'names[]=hadith' -f 'names[]=sunnah' -f 'names[]=islam' \
  -f 'names[]=muslim' -f 'names[]=open-source' \
  --jq '.names | @csv' | sed 's/"//g' | xargs -I{} echo "  islamwiki: [{}]"

# chatislam
gh api -X PUT "repos/${ORG}/chatislam/topics" \
  -f 'names[]=ai' -f 'names[]=islamic' -f 'names[]=dawah' \
  -f 'names[]=chatbot' -f 'names[]=fatwa' -f 'names[]=quran' \
  -f 'names[]=llm' -f 'names[]=muslim' \
  --jq '.names | @csv' | sed 's/"//g' | xargs -I{} echo "  chatislam: [{}]"

echo ""
echo "Done. Topics set on all 3 public repos."
echo "NOTE: Social preview images must be set manually via GitHub repo settings"
echo "      once OG image assets are generated (T-P7-C-S10-T04)."
