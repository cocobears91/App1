"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ClusterSummary } from "@/lib/types";
import { ClusterTable } from "@/features/clusters/components/ClusterTable";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ClusterReviewPage() {
  const queryClient = useQueryClient();

  const clustersQuery = useQuery({
    queryKey: ["clusters"],
    queryFn: apiClient.listClusters,
  });

  const approveMutation = useMutation({
    mutationFn: (clusterId: string) => apiClient.approveCluster(clusterId),
    onMutate: async (clusterId) => {
      await queryClient.cancelQueries({ queryKey: ["clusters"] });
      const previous = queryClient.getQueryData<ClusterSummary[]>(["clusters"]);

      queryClient.setQueryData<ClusterSummary[] | undefined>(["clusters"], (clusters) =>
        clusters?.map((cluster) =>
          cluster.id === clusterId ? { ...cluster, moderationState: "APPROVED" } : cluster,
        ),
      );

      return { previous };
    },
    onError: (_error, _clusterId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["clusters"], context.previous);
      }
    },
    onSuccess: (updatedCluster) => {
      queryClient.setQueryData<ClusterSummary[] | undefined>(["clusters"], (clusters) =>
        clusters?.map((cluster) => (cluster.id === updatedCluster.id ? updatedCluster : cluster)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clusterId: string) => apiClient.deleteCluster(clusterId),
    onMutate: async (clusterId) => {
      await queryClient.cancelQueries({ queryKey: ["clusters"] });
      const previous = queryClient.getQueryData<ClusterSummary[]>(["clusters"]);

      queryClient.setQueryData<ClusterSummary[] | undefined>(["clusters"], (clusters) =>
        clusters?.filter((cluster) => cluster.id !== clusterId),
      );

      return { previous };
    },
    onError: (_error, _clusterId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["clusters"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
  });

  const busyClusterId = approveMutation.isPending
    ? approveMutation.variables ?? null
    : deleteMutation.isPending
      ? deleteMutation.variables ?? null
      : null;

  return (
    <div className="space-y-6">
      <Card className="space-y-2 bg-white/80 dark:bg-slate-900/60">
        <h1 className="text-xl font-semibold">Cluster review</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Approve the clusters that should move forward. Archiving removes them from Notion and future prioritisation lists.
        </p>
        <Button asChild variant="secondary" size="sm" className="self-start">
          <Link href="/market-analysis">View market analysis summary</Link>
        </Button>
      </Card>

      {clustersQuery.isLoading && <LoadingState label="Loading clusters" />}
      {clustersQuery.isError && (
        <Alert tone="error">
          {clustersQuery.error instanceof Error
            ? clustersQuery.error.message
            : "Unable to load clusters. Please refresh."}
        </Alert>
      )}

      {clustersQuery.data && (
        <ClusterTable
          clusters={clustersQuery.data}
          onApprove={(cluster) => approveMutation.mutate(cluster.id)}
          onDelete={(cluster) => deleteMutation.mutate(cluster.id)}
          busyClusterId={busyClusterId as string | null}
        />
      )}
    </div>
  );
}
