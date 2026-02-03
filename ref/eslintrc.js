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
  plugins: ['react', 'prettier', 'unused-imports'],
  rules: {
    'prettier/prettier':
      process.env.NODE_ENV === 'development' ? 'warn' : 'off',
    'no-fallthrough': 'off',
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    'unused-imports/no-unused-imports':
      process.env.NODE_ENV === 'development' ? 'warn' : 'off',
    'no-case-declarations': 'off',
    'import/no-anonymous-default-export': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'no-unused-vars': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
