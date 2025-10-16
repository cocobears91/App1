import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/providers/AuthProvider';
import QueryProvider from './src/providers/QueryProvider';

const buildNavigationTheme = (): Theme => {
  const base = DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: '#0F172A',
      primary: '#38BDF8',
      card: '#1E293B',
      text: '#F8FAFC',
      border: '#1E293B',
      notification: '#38BDF8',
    },
  };
};

export default function App() {
  const theme = useMemo(buildNavigationTheme, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <NavigationContainer theme={theme}>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
