import baseConfig from './base.mjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const reactRecommended = reactPlugin.configs.recommended;
const reactJsxRuntime = reactPlugin.configs['jsx-runtime'];
const reactHooksRecommended = reactHooksPlugin.configs.recommended;

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      ...reactHooksRecommended.rules,
      'react/prop-types': 'off',
    },
  },
];
