import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReact from 'eslint-plugin-react'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['public/*', '**/types.ts', 'dist/*'],
  },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/prop-types': 0,
    },
  },
]
