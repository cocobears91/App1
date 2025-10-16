import { useCallback } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { fetchIdeaDetail } from '../api/ideas';
import { IdeaDetail } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NotionStatusBadge } from '../components/NotionStatusBadge';
import { OfflineNotice } from '../components/OfflineNotice';
import { useConnectivity } from '../hooks/useConnectivity';
import { AppStackScreenProps } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import { formatDateTime } from '../utils/format';

export const IdeaDetailsScreen = () => {
  const { params } = useRoute<AppStackScreenProps<'IdeaDetails'>['route']>();
  const { ideaId } = params;
  const { apiClient } = useAuth();
  const connectivity = useConnectivity();

  const ideaQuery = useQuery({
    queryKey: ['idea', ideaId],
    queryFn: () => fetchIdeaDetail(apiClient, ideaId),
  });

  const openLink = useCallback(async (link: string) => {
    const supported = await Linking.canOpenURL(link);
    if (supported) {
      await Linking.openURL(link);
    }
  }, []);

  if (ideaQuery.isLoading) {
    return <LoadingOverlay />;
  }

  if (ideaQuery.isError || !ideaQuery.data) {
    return (
      <ErrorState
        description="We couldn't load the latest market research for this idea."
        onRetry={() => ideaQuery.refetch()}
      />
    );
  }

  const idea: IdeaDetail = ideaQuery.data;

  return (
    <View style={styles.container}>
      <OfflineNotice visible={connectivity.isOffline} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            tintColor="#38BDF8"
            refreshing={ideaQuery.isRefetching}
            onRefresh={() => ideaQuery.refetch()}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{idea.title}</Text>
            <Text style={styles.timestamp}>Last analyzed {formatDateTime(idea.lastAnalyzedAt)}</Text>
          </View>
          <NotionStatusBadge status={idea.notionSyncStatus} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem</Text>
          <Text style={styles.bodyText}>{idea.problem}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solution</Text>
          <Text style={styles.bodyText}>{idea.solution}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market research summary</Text>
          <Text style={styles.bodyText}>{idea.marketResearch.summary}</Text>
        </View>

        <View style={styles.researchGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Demand score</Text>
            <Text style={styles.metricValue}>{idea.marketResearch.demandScore}/100</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Target customers</Text>
            <Text style={styles.metricValue}>{idea.marketResearch.targetCustomers}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competitor landscape</Text>
          {idea.marketResearch.competitorOverview.length ? (
            <View style={styles.listContainer}>
              {idea.marketResearch.competitorOverview.map((competitor, index) => (
                <Text style={styles.listItem} key={`${idea.id}-competitor-${index}`}>
                  • {competitor}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>No direct competitors identified yet.</Text>
          )}
        </View>

        {idea.marketResearch.pricingInsights ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing insights</Text>
            <Text style={styles.bodyText}>{idea.marketResearch.pricingInsights}</Text>
          </View>
        ) : null}

        {idea.marketResearch.additionalNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional notes</Text>
            <Text style={styles.bodyText}>{idea.marketResearch.additionalNotes}</Text>
          </View>
        ) : null}

        {idea.researchLinks?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Research links</Text>
            <View style={styles.linksContainer}>
              {idea.researchLinks.map((link, index) => (
                <TouchableOpacity
                  key={`${idea.id}-link-${index}`}
                  onPress={() => openLink(link)}
                  style={styles.linkPill}
                >
                  <Text style={styles.linkText}>{link}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    padding: 18,
  },
  titleGroup: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
  },
  timestamp: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 13,
  },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 18,
    gap: 10,
    padding: 18,
  },
  sectionTitle: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
  bodyText: {
    color: 'rgba(226, 232, 240, 0.92)',
    fontSize: 15,
    lineHeight: 22,
  },
  researchGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 18,
    flex: 1,
    gap: 4,
    padding: 16,
  },
  metricLabel: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    color: 'rgba(203, 213, 225, 0.95)',
    fontSize: 15,
  },
  linksContainer: {
    gap: 12,
  },
  linkPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
});
