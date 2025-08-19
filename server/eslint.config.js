export default [
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
	{
		languageOptions: {
			parser: '@typescript-eslint/parser',
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: 'module',
			},
			globals: {
				NodeJS: 'readonly',
			},
		},
		rules: {
			'no-console': 'off',
			'unused-imports/no-unused-imports': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
		}
	}
]
