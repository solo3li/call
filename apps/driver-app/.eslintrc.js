module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Impeccable standard enforces rigorous consistency
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-native/no-inline-styles': 'error' // Enforce separation of styles
  }
};
