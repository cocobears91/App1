"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ProcessingTaskCard } from "@/features/status/components/ProcessingTaskCard";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ProcessingStatusPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params.taskId;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["processing-task", taskId],
    queryFn: () => apiClient.getProcessingTask(taskId),
    refetchInterval: (queryInstance) => {
      const data = queryInstance.state.data;
      if (!data) return 4000;
      return data.status === "COMPLETED" || data.status === "FAILED" ? false : 4000;
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => apiClient.patchNotionSync(taskId, "POST"),
    onSuccess: (task) => {
      queryClient.setQueryData(["processing-task", taskId], task);
    },
  });

  return (
    <div className="space-y-6">
      {query.isLoading && <LoadingState label="Fetching latest status" />}
      {query.isError && (
        <Alert tone="error" className="space-y-2">
          <p className="font-semibold">Unable to retrieve processing status.</p>
          <p className="text-sm opacity-80">
            {query.error instanceof Error ? query.error.message : "Please refresh the page or try again later."}
          </p>
          <Button size="sm" variant="secondary" onClick={() => query.refetch()}>
            Retry
          </Button>
        </Alert>
      )}
      {query.data && (
        <>
          <ProcessingTaskCard
            task={query.data}
            onSyncRequest={() => syncMutation.mutate()}
            isSyncing={syncMutation.isPending}
          />
          {syncMutation.isError && (
            <Alert tone="warning">
              {syncMutation.error instanceof ApiError
                ? syncMutation.error.message
                : "Unable to trigger a new Notion sync. Please try again soon."}
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
