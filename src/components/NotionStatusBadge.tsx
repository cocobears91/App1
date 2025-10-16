import { StyleSheet, Text, View } from 'react-native';

import { NotionSyncStatus } from '../api/types';

const STATUS_LABELS: Record<NotionSyncStatus, string> = {
  idle: 'Not synced',
  syncing: 'Syncing to Notion…',
  synced: 'Synced',
  error: 'Sync failed',
};

const STATUS_COLORS: Record<NotionSyncStatus, { background: string; text: string }> = {
  idle: { background: 'rgba(203, 213, 225, 0.12)', text: '#E2E8F0' },
  syncing: { background: 'rgba(59, 130, 246, 0.18)', text: '#60A5FA' },
  synced: { background: 'rgba(45, 212, 191, 0.18)', text: '#5EEAD4' },
  error: { background: 'rgba(248, 113, 113, 0.18)', text: '#FCA5A5' },
};

interface NotionStatusBadgeProps {
  status: NotionSyncStatus;
  dense?: boolean;
}

export const NotionStatusBadge = ({ status, dense = false }: NotionStatusBadgeProps) => {
  const label = STATUS_LABELS[status] ?? 'Unknown';
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.idle;

  return (
    <View style={[styles.container, dense && styles.denseContainer, { backgroundColor: colors.background }]}
      accessibilityRole="status"
    >
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  denseContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
