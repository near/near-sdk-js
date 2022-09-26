module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ['./**/*.ts', './**/*.js'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./{t,j}sconfig.json', './**/{t,j}sconfig.json'],
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
  ignorePatterns: ['./**/node_modules', 'node_modules', './**/lib', 'lib', './**/build', 'build', './**/deps', 'deps'],
  rules: {},
}
