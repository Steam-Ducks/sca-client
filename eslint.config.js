import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: globals.browser
    }
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },

  {
    ignores: ['dist/**', 'node_modules/**']
  }
]