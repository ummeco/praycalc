#!/usr/bin/env bash
# Audit script: every PR-triggering workflow must declare a `concurrency:` block.
# Release / deploy workflows are exempted (they keep cancel-in-progress: false).
# Source: .claude/planning/p7-wave4-cicd-2026-05-07.md (T-P7-Q-CI-04)
#
# Exit code:
#   0 — all PR workflows have concurrency blocks
#   1 — one or more PR workflows missing the block
#
# Usage:
#   .github/scripts/check-concurrency.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKFLOWS_DIR="${REPO_ROOT}/.github/workflows"

if [[ ! -d "${WORKFLOWS_DIR}" ]]; then
  echo "No workflows directory at ${WORKFLOWS_DIR} — nothing to check"
  exit 0
fi

EXEMPT_PATTERNS='release|deploy-production|deploy-staging|android-release|ios-release'
MISSING=()

for f in "${WORKFLOWS_DIR}"/*.yml "${WORKFLOWS_DIR}"/*.yaml; do
  [[ -e "$f" ]] || continue
  base="$(basename "$f")"
  if [[ "$base" =~ $EXEMPT_PATTERNS ]]; then
    continue
  fi
  if ! grep -q "pull_request" "$f"; then
    continue
  fi
  if ! grep -q "^concurrency:" "$f"; then
    MISSING+=("$f")
  fi
done

if [[ ${#MISSING[@]} -eq 0 ]]; then
  echo "OK — every PR-triggering workflow has a concurrency block"
  exit 0
fi

echo "FAIL — the following PR-triggering workflows lack a concurrency block:"
for f in "${MISSING[@]}"; do
  echo "  - $f"
done
echo
echo "Add this block under the 'on:' section of each:"
echo "  concurrency:"
echo "    group: \${{ github.workflow }}-\${{ github.ref }}"
echo "    cancel-in-progress: true"
exit 1
