import { useCallback } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveCluster,
  fetchBatchClusters,
  refreshClusterProcessing,
  rejectCluster,
  triggerClusterReanalysis,
} from '../api/ideas';
import { ClusterActionResponse, ClusterDetail, IdeaSummary } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NotionStatusBadge } from '../components/NotionStatusBadge';
import { OfflineNotice } from '../components/OfflineNotice';
import { useConnectivity } from '../hooks/useConnectivity';
import { AppStackScreenProps } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import {
  formatDateTime,
  formatDecisionStatus,
  formatProcessingStatus,
} from '../utils/format';

export const ClusterOverviewScreen = () => {
  const { params } = useRoute<AppStackScreenProps<'ClusterOverview'>['route']>();
  const navigation = useNavigation<AppStackScreenProps<'ClusterOverview'>['navigation']>();
  const { batchId } = params;

  const { apiClient } = useAuth();
  const connectivity = useConnectivity();
  const queryClient = useQueryClient();

  const clustersQuery = useQuery({
    queryKey: ['clusters', batchId],
    queryFn: () => fetchBatchClusters(apiClient, batchId),
  });

  const mutationErrorHandler = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Please try again shortly.';
    Alert.alert('Action failed', message);
  }, []);

  const updateClusterCache = useCallback(
    (clusterId: string, updater: (cluster: ClusterDetail) => ClusterDetail) => {
      queryClient.setQueryData<ClusterDetail[]>(['clusters', batchId], (current) => {
        if (!current) {
          return current;
        }

        return current.map((cluster) => (cluster.id === clusterId ? updater(cluster) : cluster));
      });
    },
    [batchId, queryClient],
  );

  const handleMutationSuccess = useCallback(
    (clusterId: string, response: ClusterActionResponse) => {
      updateClusterCache(clusterId, (cluster) => ({
        ...cluster,
        decisionStatus: response.status,
        processingStatus: response.processingStatus,
        notionSyncStatus: response.notionSyncStatus ?? cluster.notionSyncStatus,
        updatedAt: response.updatedAt,
      }));
    },
    [updateClusterCache],
  );

  const approveMutation = useMutation({
    mutationFn: (clusterId: string) => approveCluster(apiClient, clusterId),
    onSuccess: (response, clusterId) => {
      handleMutationSuccess(clusterId, response);
    },
    onError: mutationErrorHandler,
  });

  const rejectMutation = useMutation({
    mutationFn: (clusterId: string) => rejectCluster(apiClient, clusterId),
    onSuccess: (response, clusterId) => {
      handleMutationSuccess(clusterId, response);
    },
    onError: mutationErrorHandler,
  });

  const reanalyzeMutation = useMutation({
    mutationFn: (clusterId: string) => triggerClusterReanalysis(apiClient, clusterId),
    onSuccess: (response, clusterId) => {
      handleMutationSuccess(clusterId, response);
    },
    onError: mutationErrorHandler,
  });

  const refreshMutation = useMutation({
    mutationFn: (clusterId: string) => refreshClusterProcessing(apiClient, clusterId),
    onSuccess: (response, clusterId) => {
      handleMutationSuccess(clusterId, response);
    },
    onError: mutationErrorHandler,
  });

  const mutationForCluster = (clusterId: string) => ({
    approvePending: approveMutation.isPending && approveMutation.variables === clusterId,
    rejectPending: rejectMutation.isPending && rejectMutation.variables === clusterId,
    reanalyzePending: reanalyzeMutation.isPending && reanalyzeMutation.variables === clusterId,
    refreshPending: refreshMutation.isPending && refreshMutation.variables === clusterId,
  });

  const handleDecision = useCallback(
    (clusterId: string, action: 'approve' | 'reject') => {
      if (action === 'approve') {
        approveMutation.mutate(clusterId);
      } else {
        rejectMutation.mutate(clusterId);
      }
    },
    [approveMutation, rejectMutation],
  );

  const handleIdeaPress = useCallback(
    (clusterId: string, idea: IdeaSummary) => {
      navigation.navigate('IdeaDetails', {
        batchId,
        clusterId,
        ideaId: idea.id,
      });
    },
    [batchId, navigation],
  );

  const renderIdea = useCallback(
    (clusterId: string, idea: IdeaSummary) => (
      <TouchableOpacity
        key={idea.id}
        onPress={() => handleIdeaPress(clusterId, idea)}
        style={styles.ideaRow}
      >
        <View style={styles.ideaHeader}>
          <Text style={styles.ideaTitle}>{idea.title}</Text>
          <Text style={styles.ideaMeta}>Updated {formatDateTime(idea.lastAnalyzedAt)}</Text>
        </View>
        {idea.shortDescription ? <Text style={styles.ideaDescription}>{idea.shortDescription}</Text> : null}
      </TouchableOpacity>
    ),
    [handleIdeaPress],
  );

  const renderItem: ListRenderItem<ClusterDetail> = ({ item }) => {
    const pendingStates = mutationForCluster(item.id);
    const anyPending = Object.values(pendingStates).some(Boolean);
    const disableActions = connectivity.isOffline || anyPending;

    return (
      <View key={item.id} style={styles.clusterCard}>
        <View style={styles.clusterHeader}>
          <View style={styles.clusterTitleGroup}>
            <Text style={styles.clusterTitle}>{item.name}</Text>
            <Text style={styles.clusterDate}>Updated {formatDateTime(item.updatedAt)}</Text>
          </View>
          <NotionStatusBadge status={item.notionSyncStatus} dense />
        </View>

        <Text style={styles.clusterSummary}>{item.summary}</Text>

        <View style={styles.clusterStatsRow}>
          <Text style={styles.clusterStat}>Processing: {formatProcessingStatus(item.processingStatus)}</Text>
          <Text style={styles.clusterStat}>Status: {formatDecisionStatus(item.decisionStatus)}</Text>
          <Text style={styles.clusterStat}>Ideas: {item.ideaCount}</Text>
        </View>

        {item.insights?.length ? (
          <View style={styles.insightsContainer}>
            {item.insights.map((insight) => (
              <View key={insight.id} style={styles.insightPill}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {item.topOpportunities?.length ? (
          <View style={styles.topOpportunities}>
            <Text style={styles.sectionTitle}>Top opportunities</Text>
            {item.topOpportunities.map((opportunity, index) => (
              <Text key={`${item.id}-op-${index}`} style={styles.bulletItem}>
                • {opportunity}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            disabled={disableActions}
            onPress={() => handleDecision(item.id, 'approve')}
            style={[styles.actionButton, styles.approveButton, disableActions && styles.disabledAction]}
          >
            <Text style={styles.actionText}>{pendingStates.approvePending ? 'Approving…' : 'Approve'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disableActions}
            onPress={() => handleDecision(item.id, 'reject')}
            style={[styles.actionButton, styles.rejectButton, disableActions && styles.disabledAction]}
          >
            <Text style={styles.actionText}>{pendingStates.rejectPending ? 'Rejecting…' : 'Reject'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            disabled={disableActions}
            onPress={() => reanalyzeMutation.mutate(item.id)}
            style={[styles.secondaryAction, disableActions && styles.disabledSecondary]}
          >
            <Text style={styles.secondaryText}>
              {pendingStates.reanalyzePending ? 'Re-analyzing…' : 'Re-run analysis'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disableActions}
            onPress={() => refreshMutation.mutate(item.id)}
            style={[styles.secondaryAction, disableActions && styles.disabledSecondary]}
          >
            <Text style={styles.secondaryText}>
              {pendingStates.refreshPending ? 'Refreshing…' : 'Refresh status'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ideasContainer}>
          <Text style={styles.sectionTitle}>Ideas in this cluster</Text>
          {item.ideas.length ? item.ideas.map((idea) => renderIdea(item.id, idea)) : (
            <Text style={styles.emptyIdeas}>No ideas associated with this cluster yet.</Text>
          )}
        </View>
      </View>
    );
  };

  if (clustersQuery.isLoading) {
    return <LoadingOverlay />;
  }

  if (clustersQuery.isError) {
    return (
      <ErrorState
        description="We couldn't load clusters for this batch."
        onRetry={() => clustersQuery.refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <OfflineNotice visible={connectivity.isOffline} />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={clustersQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            tintColor="#38BDF8"
            refreshing={clustersQuery.isRefetching}
            onRefresh={() => clustersQuery.refetch()}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No clusters yet</Text>
            <Text style={styles.emptyDescription}>
              We will surface cluster insights here as soon as analysis finishes.
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
    paddingBottom: 48,
  },
  clusterCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 18,
    gap: 16,
    padding: 18,
  },
  clusterHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clusterTitleGroup: {
    flex: 1,
    gap: 6,
  },
  clusterTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  clusterDate: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 13,
  },
  clusterSummary: {
    color: 'rgba(226, 232, 240, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  clusterStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  clusterStat: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 999,
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  insightsContainer: {
    gap: 12,
  },
  insightPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    gap: 4,
    padding: 12,
  },
  insightTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  insightDescription: {
    color: 'rgba(148, 163, 184, 0.95)',
    fontSize: 14,
    lineHeight: 20,
  },
  topOpportunities: {
    gap: 6,
  },
  bulletItem: {
    color: 'rgba(203, 213, 225, 0.9)',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  approveButton: {
    backgroundColor: '#34D399',
  },
  rejectButton: {
    backgroundColor: '#F87171',
  },
  actionText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledAction: {
    opacity: 0.7,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledSecondary: {
    opacity: 0.6,
  },
  ideasContainer: {
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  ideaRow: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    gap: 6,
    padding: 12,
  },
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ideaTitle: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  ideaMeta: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 12,
  },
  ideaDescription: {
    color: 'rgba(203, 213, 225, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyIdeas: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 13,
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
