module.exports = {
  root: true,
  env: { node: true, es2023: true, browser: true },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'build', 'node_modules'],
  rules: { 'unicorn/prefer-module': 'off' }
};

