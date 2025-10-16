import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({ message = 'Loading…', fullScreen = true }: LoadingOverlayProps) => (
  <View style={[styles.container, fullScreen && styles.fullScreenContainer]}>
    <ActivityIndicator size="large" color="#38BDF8" />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  fullScreenContainer: {
    flex: 1,
  },
  message: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
});
