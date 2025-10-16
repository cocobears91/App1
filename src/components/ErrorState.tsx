import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'We ran into an issue',
  description = 'Please try again shortly.',
  actionLabel = 'Retry',
  onRetry,
}: ErrorStateProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {onRetry ? (
      <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderRadius: 12,
    gap: 12,
    margin: 16,
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: 'rgba(226, 232, 240, 0.85)',
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#38BDF8',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: '600',
  },
});
