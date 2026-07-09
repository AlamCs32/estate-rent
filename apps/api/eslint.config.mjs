import nestConfig from '@repo/eslint-config/nest.mjs';

export default [
  ...nestConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];
