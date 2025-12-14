import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
	{ files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.browser } },
	tseslint.configs.recommended,
	pluginVue.configs['flat/essential'],
	{ files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
	{
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			'object-curly-spacing': ['error', 'always'],
			'semi': ['error', 'always'],
			'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
			// 'indent': ['error', 'tab', { 'ObjectExpression': 1 }],
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/indent': ['error', 'tab'],
			'vue/html-indent': ['error', 'tab'],
			'vue/multi-word-component-names': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'off',
			'unused-imports/no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-empty-object-type': 'off'
		}
	}
]);
