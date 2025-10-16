import { UploadMetadata, UploadResponse, ProcessingTask, ClusterSummary, IdeaDetail, MarketAnalysisSummary, ApiListResponse } from "@/lib/types";

type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new ApiError("Unable to parse server response", response.status, error);
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    throw new ApiError(details && typeof details === "object" && "message" in (details as Record<string, unknown>)
      ? String((details as Record<string, unknown>).message)
      : response.statusText || "Request failed",
    response.status,
    details);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return parseJson<T>(response);
}

export async function uploadZipArchive(file: File, metadata: UploadMetadata): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("metadata", JSON.stringify(metadata));

  return apiFetch<UploadResponse>("/api/uploads", {
    method: "POST",
    body: formData,
  });
}

export async function getProcessingTask(taskId: string): Promise<ProcessingTask> {
  return apiFetch<ProcessingTask>(`/api/tasks/${taskId}`);
}

export async function listClusters(): Promise<ClusterSummary[]> {
  const response = await apiFetch<ApiListResponse<ClusterSummary>>("/api/clusters");
  return response.items;
}

export async function approveCluster(clusterId: string): Promise<ClusterSummary> {
  return apiFetch<ClusterSummary>(`/api/clusters/${clusterId}/approve`, {
    method: "POST",
  });
}

export async function deleteCluster(clusterId: string): Promise<void> {
  await apiFetch(`/api/clusters/${clusterId}`, {
    method: "DELETE",
  });
}

export async function getIdeaDetail(ideaId: string): Promise<IdeaDetail> {
  const query = `#graphql
    query IdeaDetail($id: ID!) {
      idea(id: $id) {
        id
        title
        clusterId
        description
        insights
        recommendation
        stage
        persona
        notionPageUrl
        marketSignals {
          title
          strength
          description
        }
      }
    }
  `;

  return graphqlRequest<{ idea: IdeaDetail }>(query, { id: ideaId }).then((result) => result.idea);
}

export async function getMarketAnalysis(): Promise<MarketAnalysisSummary> {
  return apiFetch<MarketAnalysisSummary>("/api/market-analysis");
}

interface GraphQLError {
  message: string;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLError[];
}

export async function graphqlRequest<TData>(query: string, variables?: Record<string, unknown>): Promise<TData> {
  const response = await apiFetch<GraphQLResponse<TData>>("/graphql", {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  });

  if (response.errors?.length) {
    throw new ApiError(response.errors[0]?.message ?? "GraphQL request failed", 400, response.errors);
  }

  if (!response.data) {
    throw new ApiError("GraphQL response did not include data", 500, response);
  }

  return response.data;
}

export async function patchNotionSync(taskId: string, method: FetchMethod = "POST"): Promise<ProcessingTask> {
  return apiFetch<ProcessingTask>(`/api/tasks/${taskId}/notion`, {
    method,
  });
}

export type ApiClient = {
  uploadZipArchive: typeof uploadZipArchive;
  getProcessingTask: typeof getProcessingTask;
  listClusters: typeof listClusters;
  approveCluster: typeof approveCluster;
  deleteCluster: typeof deleteCluster;
  getIdeaDetail: typeof getIdeaDetail;
  getMarketAnalysis: typeof getMarketAnalysis;
  graphqlRequest: typeof graphqlRequest;
  patchNotionSync: typeof patchNotionSync;
};

export const apiClient: ApiClient = {
  uploadZipArchive,
  getProcessingTask,
  listClusters,
  approveCluster,
  deleteCluster,
  getIdeaDetail,
  getMarketAnalysis,
  graphqlRequest,
  patchNotionSync,
};
