import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['public/**', 'coverage/**'],
  },
]

export default eslintConfig
