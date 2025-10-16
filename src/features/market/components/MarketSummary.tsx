import { MarketAnalysisSummary } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MarketSummary({ analysis }: { analysis: MarketAnalysisSummary }) {
  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-500">Generated {new Date(analysis.generatedAt).toLocaleString()}</p>
            <h1 className="text-2xl font-semibold">Executive summary</h1>
          </div>
          <div className="flex gap-2">
            <Badge variant="info">Ideas: {analysis.totalIdeas}</Badge>
            <Badge variant="success">Approved clusters: {analysis.approvedClusters}</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{analysis.executiveSummary}</p>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Validated opportunities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analysis.insights.map((insight) => (
            <Card key={insight.id} className="space-y-3 bg-white/80 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{insight.headline}</h3>
                <Badge variant="success">{Math.round(insight.confidence * 100)}% confidence</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{insight.implication}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {insight.relatedClusterIds.map((id) => (
                  <span key={id} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                    Cluster {id}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
