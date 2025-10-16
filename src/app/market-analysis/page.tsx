"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { MarketSummary } from "@/features/market/components/MarketSummary";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert } from "@/components/ui/alert";

export default function MarketAnalysisPage() {
  const query = useQuery({
    queryKey: ["market-analysis"],
    queryFn: apiClient.getMarketAnalysis,
  });

  if (query.isLoading) {
    return <LoadingState label="Compiling market analysis" />;
  }

  if (query.isError) {
    return (
      <Alert tone="error">
        {query.error instanceof Error ? query.error.message : "Unable to fetch market analysis."}
      </Alert>
    );
  }

  if (!query.data) {
    return <Alert tone="warning">No market analysis generated yet. Check back after approving clusters.</Alert>;
  }

  return <MarketSummary analysis={query.data} />;
}
