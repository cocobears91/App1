export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ClusterDecisionStatus = 'new' | 'in_review' | 'approved' | 'rejected';
export type NotionSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface BatchSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalClusters: number;
  completedClusters: number;
  status: ProcessingStatus;
}

export interface ClusterSummary {
  id: string;
  batchId: string;
  name: string;
  summary: string;
  processingStatus: ProcessingStatus;
  decisionStatus: ClusterDecisionStatus;
  notionSyncStatus: NotionSyncStatus;
  updatedAt: string;
  ideaCount: number;
  marketSizeEstimate?: string;
}

export interface ClusterInsight {
  id: string;
  title: string;
  description: string;
}

export interface IdeaSummary {
  id: string;
  clusterId: string;
  title: string;
  shortDescription?: string;
  demandScore?: number;
  notionSyncStatus: NotionSyncStatus;
  lastAnalyzedAt: string;
}

export interface IdeaDetail extends IdeaSummary {
  problem: string;
  solution: string;
  marketResearch: {
    summary: string;
    demandScore: number;
    competitorOverview: string[];
    pricingInsights?: string;
    targetCustomers: string;
    additionalNotes?: string;
  };
  researchLinks?: string[];
}

export interface ClusterDetail extends ClusterSummary {
  insights: ClusterInsight[];
  ideas: IdeaSummary[];
  topOpportunities?: string[];
  lastAnalyzedAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt?: string;
  refreshToken?: string;
}

export interface ClusterActionResponse {
  status: ClusterDecisionStatus;
  processingStatus: ProcessingStatus;
  notionSyncStatus: NotionSyncStatus;
  updatedAt: string;
}
