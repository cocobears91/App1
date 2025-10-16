import '@testing-library/jest-native/extend-expect';

import { setLogger } from '@tanstack/react-query';

setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {
    // Silence React Query network errors in test output
  },
});

declare global {
  // eslint-disable-next-line no-var
  var __expoEnvironment: string | undefined;
}

global.__expoEnvironment = 'test';

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
  addNetworkStateListener: jest.fn((listener: (state: { isConnected: boolean; isInternetReachable: boolean }) => void) => {
    listener({ isConnected: true, isInternetReachable: true });
    return { remove: jest.fn() };
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
