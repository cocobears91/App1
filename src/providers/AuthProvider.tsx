import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as SecureStore from 'expo-secure-store';

import { ApiClient, ApiError, OfflineError, createApiClient } from '../api/client';
import { login as loginRequest } from '../api/auth';

const TOKEN_STORAGE_KEY = 'ideas-client-auth-token';

interface AuthContextValue {
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  apiClient: ApiClient;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
        if (storedToken && isMounted) {
          setToken(storedToken);
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    void loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const apiClient = useMemo<ApiClient>(() => createApiClient(() => token), [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();

      try {
        const response = await loginRequest({ email: trimmedEmail, password });
        if (!response?.token) {
          throw new Error('Missing authentication token in response.');
        }
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, response.token);
        setToken(response.token);
      } catch (error) {
        if (error instanceof OfflineError) {
          throw new OfflineError('Unable to sign in while offline.');
        }

        if (error instanceof ApiError && error.status === 401) {
          throw new Error('Invalid credentials. Please try again.');
        }

        if (error instanceof Error) {
          throw error;
        }

        throw new Error('An unexpected error occurred during sign-in.');
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      initializing,
      login,
      logout,
      apiClient,
    }),
    [apiClient, initializing, login, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
