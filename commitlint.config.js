// Commitlint — canonical Conventional Commits config for Ummeco repos
// Source: .claude/planning/p7-wave4-cicd-2026-05-07.md

module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Dependabot commits append `Signed-off-by:` / `Co-authored-by:` trailers
  // directly after the YAML front-matter block with no blank line separator,
  // which trips `footer-leading-blank`. These commits are bot-generated and
  // already Conventional-Commits-shaped (type(deps): ...) — ignore only that
  // exact bot signature, keep full enforcement for human commits.
  ignores: [
    (message) => message.includes('Signed-off-by: dependabot[bot]'),
  ],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'docs', 'test', 'refactor',
      'perf', 'style', 'ci', 'build', 'revert',
    ]],
    'scope-enum': [1, 'always', [
      // ummat scopes
      'app', 'pro', 'dev', 'chat', 'base', 'backend', 'shared',
      // praycalc scopes
      'web', 'org', 'flutter', 'macos', 'watchos', 'smart',
      // islamwiki scopes
      'workers', 'data',
      // chatislam scopes (web shared)
      // flock scopes
      'apps', 'site',
      // cross-cutting
      'deps', 'ci', 'release', 'docs',
    ]],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
