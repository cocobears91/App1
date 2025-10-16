export type ProcessingState =
  | "QUEUED"
  | "PROCESSING"
  | "CLUSTERING"
  | "SYNCING"
  | "COMPLETED"
  | "FAILED";

export type NotionSyncState = "DISCONNECTED" | "SYNCING" | "SYNCED" | "ERROR";

export interface UploadMetadata {
  workspaceId: string;
  notes?: string;
  tags?: string[];
}

export interface UploadResponse {
  taskId: string;
  message: string;
}

export interface ProcessingTask {
  id: string;
  status: ProcessingState;
  progress: number;
  totalSteps: number;
  startedAt: string;
  updatedAt: string;
  message?: string;
  notionSync: {
    status: NotionSyncState;
    lastSyncedAt?: string;
    url?: string;
    details?: string;
  };
}

export type ClusterModerationState = "PENDING" | "APPROVED" | "REJECTED";

export interface ClusterSummary {
  id: string;
  title: string;
  keywords: string[];
  ideaCount: number;
  strengthScore: number;
  summary: string;
  moderationState: ClusterModerationState;
  createdAt: string;
}

export interface IdeaDetail {
  id: string;
  title: string;
  clusterId: string;
  description: string;
  insights: string[];
  recommendation: string;
  stage: "DRAFT" | "REVIEW" | "PUBLISHED";
  persona?: string;
  notionPageUrl?: string;
  marketSignals: Array<{
    title: string;
    strength: "WEAK" | "MEDIUM" | "STRONG";
    description: string;
  }>;
}

export interface MarketTrendInsight {
  id: string;
  headline: string;
  confidence: number;
  implication: string;
  relatedClusterIds: string[];
}

export interface MarketAnalysisSummary {
  generatedAt: string;
  executiveSummary: string;
  totalIdeas: number;
  approvedClusters: number;
  insights: MarketTrendInsight[];
}

export interface ApiListResponse<T> {
  items: T[];
}
