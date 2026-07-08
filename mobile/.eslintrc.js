module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    // Base rule off in favor of the TS-aware version below — it doesn't understand
    // TS-only syntax (e.g. mapped-type params like `[P in keyof X]`) and false-positives
    // on them; this is the standard typescript-eslint guidance for TS projects.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
