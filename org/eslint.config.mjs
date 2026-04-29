import nextConfig from 'eslint-config-next'
import noBrandLightOnLight from '../../ummat/apps/brand/src/eslint-rule-no-brand-light-on-light.js'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['public/**', 'coverage/**'],
  },
  // C-09a-FIX-01: brand contrast guard — block text-brand-light / text-brand-mid in JSX/TSX.
  {
    plugins: { ummat: { rules: { 'no-brand-light-on-light': noBrandLightOnLight } } },
    rules: {
      'ummat/no-brand-light-on-light': 'error',
    },
  },
]

export default eslintConfig
