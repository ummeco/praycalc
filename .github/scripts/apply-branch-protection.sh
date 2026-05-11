#!/usr/bin/env bash
# Apply canonical branch protection rules to main.
# Source: .claude/planning/p7-wave4-cicd-2026-05-07.md (canonical table)
#
# Usage:
#   .github/scripts/apply-branch-protection.sh [--dry-run]
#
# Requires:
#   - GITHUB_TOKEN (or gh auth login) with admin:repo
#   - jq, gh CLI installed
#   - .github/branch-protection.json present at repo root
#
# Idempotent: safe to re-run; gh api PUT replaces the rule wholesale.

set -euo pipefail

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
JSON_FILE="${REPO_ROOT}/.github/branch-protection.json"

if [[ ! -f "${JSON_FILE}" ]]; then
  echo "ERROR: ${JSON_FILE} not found" >&2
  exit 1
fi

REPO_FULL="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
if [[ -z "${REPO_FULL}" ]]; then
  echo "ERROR: could not resolve current repo (gh repo view)" >&2
  exit 1
fi

echo "Repo:    ${REPO_FULL}"
echo "Branch:  main"
echo "Source:  ${JSON_FILE}"
echo

echo "=== Current protection (before) ==="
gh api "repos/${REPO_FULL}/branches/main/protection" 2>/dev/null | jq . || echo "(no current protection)"
echo

if [[ "${DRY_RUN}" == "1" ]]; then
  echo "=== DRY RUN — would PUT ==="
  jq . "${JSON_FILE}"
  echo "Skipping apply (dry run)."
  exit 0
fi

echo "=== Applying canonical protection ==="
gh api -X PUT "repos/${REPO_FULL}/branches/main/protection" --input "${JSON_FILE}"
echo

echo "=== Current protection (after) ==="
gh api "repos/${REPO_FULL}/branches/main/protection" | jq .
