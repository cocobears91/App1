"use client";

import { ComponentProps } from "react";
import { ClusterSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClusterTableProps {
  clusters: ClusterSummary[];
  onApprove: (cluster: ClusterSummary) => void;
  onDelete: (cluster: ClusterSummary) => void;
  busyClusterId?: string | null;
}

const stateCopy: Record<ClusterSummary["moderationState"], { label: string; variant: ComponentProps<typeof Badge>["variant"] }> = {
  PENDING: { label: "Awaiting review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Archived", variant: "danger" },
};

export function ClusterTable({ clusters, onApprove, onDelete, busyClusterId }: ClusterTableProps) {
  if (clusters.length === 0) {
    return <p className="text-sm text-slate-500">No clusters yet. Upload a zip archive to get started.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/80 dark:bg-slate-900/60">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cluster
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Keywords
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ideas
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Strength
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th scope="col" className="px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {clusters.map((cluster) => {
            const busy = busyClusterId === cluster.id;
            const status = stateCopy[cluster.moderationState];
            return (
              <tr key={cluster.id} data-testid="cluster-row">
                <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <div>{cluster.title}</div>
                  <p className="text-xs text-slate-500">Added {new Date(cluster.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {cluster.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{cluster.ideaCount}</td>
                <td className="px-4 py-4 text-sm text-slate-500">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{cluster.strengthScore}/100</span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onApprove(cluster)}
                      disabled={busy || cluster.moderationState === "APPROVED"}
                      isLoading={busy && cluster.moderationState !== "APPROVED"}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(cluster)}
                      disabled={busy}
                      isLoading={busy}
                    >
                      Archive
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
