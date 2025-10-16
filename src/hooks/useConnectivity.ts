import { useEffect, useState } from 'react';

import * as Network from 'expo-network';

export interface ConnectivityState {
  isConnected: boolean | null;
  isOffline: boolean;
}

export const useConnectivity = (): ConnectivityState => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const updateConnectivity = (state: Network.NetworkState) => {
      if (!mounted) {
        return;
      }
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsConnected(connected);
    };

    const hydrate = async () => {
      const state = await Network.getNetworkStateAsync();
      updateConnectivity(state);
    };

    void hydrate();

    const subscription = Network.addNetworkStateListener(updateConnectivity);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return {
    isConnected,
    isOffline: isConnected === false,
  };
};
