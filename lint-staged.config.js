// Lint-staged — canonical config for Ummeco repos
// Source: .claude/planning/p7-wave4-cicd-2026-05-07.md

module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
