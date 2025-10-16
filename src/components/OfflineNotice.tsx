import { StyleSheet, Text, View } from 'react-native';

interface OfflineNoticeProps {
  visible: boolean;
  message?: string;
}

export const OfflineNotice = ({ visible, message = 'Offline mode. Showing cached insights.' }: OfflineNoticeProps) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F97316',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
});
