"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { IdeaOverview } from "@/features/ideas/components/IdeaOverview";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert } from "@/components/ui/alert";

export default function IdeaDetailPage() {
  const params = useParams<{ ideaId: string }>();
  const ideaId = params.ideaId;

  const query = useQuery({
    queryKey: ["idea", ideaId],
    queryFn: () => apiClient.getIdeaDetail(ideaId),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading idea" />;
  }

  if (query.isError) {
    return (
      <Alert tone="error">
        {query.error instanceof Error ? query.error.message : "Unable to fetch idea details."}
      </Alert>
    );
  }

  if (!query.data) {
    return <Alert tone="warning">Idea not found.</Alert>;
  }

  return <IdeaOverview idea={query.data} />;
}
