import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Network from 'expo-network';

const PERSISTENCE_KEY = 'ideas-client-cache-v1';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        suspense: false,
        staleTime: 1000 * 60 * 5, // five minutes
        gcTime: 1000 * 60 * 60 * 24, // one day
        retry: (failureCount, error) => {
          if (error instanceof Error && error.name === 'OfflineError') {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          if (error instanceof Error && error.name === 'OfflineError') {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });

const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient);

  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        key: PERSISTENCE_KEY,
        storage: AsyncStorage,
        throttleTime: 1000,
      }),
    [],
  );

  useEffect(() => {
    const configureOnlineManager = async () => {
      const initialState = await Network.getNetworkStateAsync();
      onlineManager.setOnline(initialState.isConnected ?? false);
    };

    configureOnlineManager();

    return onlineManager.setEventListener((setOnline) => {
      const subscription = Network.addNetworkStateListener((state) => {
        const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
        setOnline(isConnected);
      });

      return () => {
        subscription.remove();
      };
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const persistOptions = useMemo(
    () => ({
      persister,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      dehydrateOptions: {
        shouldDehydrateMutation: () => true,
      },
    }),
    [persister],
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={() => {
        void queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default QueryProvider;
