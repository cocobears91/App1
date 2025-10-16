import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useMutation } from '@tanstack/react-query';

import { OfflineNotice } from '../components/OfflineNotice';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../providers/AuthProvider';

export const AuthenticationScreen = () => {
  const { login } = useAuth();
  const connectivity = useConnectivity();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error('Please enter your workspace email and password.');
      }

      await login(email, password);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now.';
      Alert.alert('Sign-in failed', message);
    },
  });

  const disabled = connectivity.isOffline || !email || !password || loginMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <OfflineNotice visible={connectivity.isOffline} message="Offline. Sign-in requires a connection." />
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage your analyzed idea batches on the go.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Work email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="founder@startup.com"
            placeholderTextColor="rgba(148, 163, 184, 0.7)"
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="rgba(148, 163, 184, 0.7)"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => loginMutation.mutate()}
          style={[styles.button, disabled && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    gap: 20,
    padding: 24,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(226, 232, 240, 0.85)',
    fontSize: 15,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
});
