module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|@react-native-async-storage|expo(nent)?|expo-.*|@expo/.*|@tanstack/.*)/)',
  ],
  testMatch: ['**/?(*.)+(spec|test).(ts|tsx)'],
};
