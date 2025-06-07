module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    quotes: ['error', 'double'],
    'jsx-quotes': ['error', 'prefer-double'],
    'prettier/prettier': ['error', { singleQuote: false, jsxSingleQuote: false }],
    'no-undef': 'off',
    'no-unused-vars': 'off',
  },
};
