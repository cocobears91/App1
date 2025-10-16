import { ApiClient } from './client';
import { BatchSummary, ClusterActionResponse, ClusterDetail, IdeaDetail } from './types';

export const fetchBatches = (client: ApiClient): Promise<BatchSummary[]> => client.get<BatchSummary[]>('/batches');

export const fetchBatchClusters = (client: ApiClient, batchId: string): Promise<ClusterDetail[]> =>
  client.get<ClusterDetail[]>(`/batches/${batchId}/clusters`);

export const fetchClusterDetail = (
  client: ApiClient,
  batchId: string,
  clusterId: string,
): Promise<ClusterDetail> => client.get<ClusterDetail>(`/batches/${batchId}/clusters/${clusterId}`);

export const fetchIdeaDetail = (client: ApiClient, ideaId: string): Promise<IdeaDetail> =>
  client.get<IdeaDetail>(`/ideas/${ideaId}`);

export const approveCluster = (client: ApiClient, clusterId: string): Promise<ClusterActionResponse> =>
  client.post<ClusterActionResponse>(`/clusters/${clusterId}/approve`);

export const rejectCluster = (client: ApiClient, clusterId: string): Promise<ClusterActionResponse> =>
  client.post<ClusterActionResponse>(`/clusters/${clusterId}/reject`);

export const triggerClusterReanalysis = (client: ApiClient, clusterId: string): Promise<ClusterActionResponse> =>
  client.post<ClusterActionResponse>(`/clusters/${clusterId}/reanalyze`);

export const refreshClusterProcessing = (client: ApiClient, clusterId: string): Promise<ClusterActionResponse> =>
  client.post<ClusterActionResponse>(`/clusters/${clusterId}/refresh`);
