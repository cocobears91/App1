import { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { fetchBatches } from '../api/ideas';
import { BatchSummary } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { OfflineNotice } from '../components/OfflineNotice';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../providers/AuthProvider';
import { formatDateTime, formatProcessingStatus } from '../utils/format';
import { AppStackScreenProps } from '../navigation/types';

export const BatchListScreen = () => {
  const { apiClient } = useAuth();
  const connectivity = useConnectivity();
  const navigation = useNavigation<AppStackScreenProps<'Batches'>['navigation']>();

  const batchesQuery = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches(apiClient),
    refetchOnReconnect: true,
  });

  const handleSelectBatch = useCallback(
    (batch: BatchSummary) => {
      navigation.navigate('ClusterOverview', {
        batchId: batch.id,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<BatchSummary> = ({ item }) => {
    const completion = item.totalClusters === 0 ? 0 : Math.round((item.completedClusters / item.totalClusters) * 100);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectBatch(item)}
        style={styles.batchCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.batchTitle}>{item.name}</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{formatProcessingStatus(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.metaText}>Updated {formatDateTime(item.updatedAt)}</Text>
        <Text style={styles.metaText}>
          {item.completedClusters} / {item.totalClusters} clusters ({completion}% complete)
        </Text>
      </TouchableOpacity>
    );
  };

  if (batchesQuery.isLoading) {
    return <LoadingOverlay />;
  }

  if (batchesQuery.isError) {
    return (
      <ErrorState
        description="We couldn't load your analysis batches."
        onRetry={() => batchesQuery.refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <OfflineNotice visible={connectivity.isOffline} />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={batchesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            tintColor="#38BDF8"
            refreshing={batchesQuery.isRefetching}
            onRefresh={() => batchesQuery.refetch()}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No analyses yet</Text>
            <Text style={styles.emptyDescription}>
              Once your idea batches are processed, they will appear here with actionable insights.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    flex: 1,
  },
  listContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  batchCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batchTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    backgroundColor: '#38BDF8',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  statusText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: 'rgba(203, 213, 225, 0.85)',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    padding: 48,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDescription: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 14,
    textAlign: 'center',
  },
});
