import { Pressable, StyleSheet, Text } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoadingOverlay } from '../components/LoadingOverlay';
import { useAuth } from '../providers/AuthProvider';
import { AppStackParamList, AuthStackParamList } from './types';
import { AuthenticationScreen } from '../screens/AuthenticationScreen';
import { BatchListScreen } from '../screens/BatchListScreen';
import { ClusterOverviewScreen } from '../screens/ClusterOverviewScreen';
import { IdeaDetailsScreen } from '../screens/IdeaDetailsScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Pressable onPress={logout} style={styles.logoutButton} accessibilityRole="button">
      <Text style={styles.logoutLabel}>Log out</Text>
    </Pressable>
  );
};

const AppStackNavigator = () => (
  <AppStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#0F172A',
      },
      headerTitleStyle: {
        fontWeight: '700',
      },
      headerTintColor: '#F8FAFC',
      headerBackTitleVisible: false,
      contentStyle: {
        backgroundColor: '#0F172A',
      },
    }}
  >
    <AppStack.Screen
      name="Batches"
      component={BatchListScreen}
      options={{
        title: 'Analysis batches',
        headerRight: () => <LogoutButton />,
      }}
    />
    <AppStack.Screen
      name="ClusterOverview"
      component={ClusterOverviewScreen}
      options={{
        title: 'Cluster overview',
      }}
    />
    <AppStack.Screen
      name="IdeaDetails"
      component={IdeaDetailsScreen}
      options={{
        title: 'Idea details',
      }}
    />
  </AppStack.Navigator>
);

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: '#0F172A',
      },
    }}
  >
    <AuthStack.Screen name="Authenticate" component={AuthenticationScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const { token, initializing } = useAuth();

  if (initializing) {
    return <LoadingOverlay />;
  }

  return token ? <AppStackNavigator /> : <AuthStackNavigator />;
};

const styles = StyleSheet.create({
  logoutButton: {
    borderColor: 'rgba(148, 163, 184, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
