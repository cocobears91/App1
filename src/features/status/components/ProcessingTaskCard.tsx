"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";
import { ProcessingTask } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NotionStatusBadge } from "@/components/notion-status-badge";
import { useAppStore } from "@/store/useAppStore";

dayjs.extend(relativeTime);

interface ProcessingTaskCardProps {
  task: ProcessingTask;
  onSyncRequest: () => void;
  isSyncing: boolean;
}

const statusCopy: Record<ProcessingTask["status"], string> = {
  QUEUED: "Your upload is in the queue",
  PROCESSING: "We are extracting qualitative insights",
  CLUSTERING: "Grouping similar insights into clusters",
  SYNCING: "Pushing to Notion workspace",
  COMPLETED: "Processing complete",
  FAILED: "Processing failed",
};

export function ProcessingTaskCard({ task, onSyncRequest, isSyncing }: ProcessingTaskCardProps) {
  const setNotionStatus = useAppStore((state) => state.setNotionStatus);

  useEffect(() => {
    setNotionStatus(task.notionSync.status);
  }, [setNotionStatus, task.notionSync.status]);

  const progress = Math.round((task.progress / Math.max(task.totalSteps, 1)) * 100);
  const lastUpdated = dayjs(task.updatedAt).fromNow();

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-blue-500">Task {task.id}</p>
          <h2 className="text-xl font-semibold">{statusCopy[task.status]}</h2>
        </div>
        <NotionStatusBadge status={task.notionSync.status} />
      </div>

      <div className="space-y-2">
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {Math.min(Math.max(progress, 0), 100)}% complete · Updated {lastUpdated}
        </p>
      </div>

      {task.message && task.status !== "COMPLETED" && <Alert tone="info">{task.message}</Alert>}

      {task.status === "FAILED" && (
        <Alert tone="error">
          Something went wrong syncing to Notion. Please try again or contact support with the task ID above.
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onSyncRequest} isLoading={isSyncing}>
          Retry Notion sync
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.location.reload()}>
          Refresh page
        </Button>
      </div>
    </Card>
  );
}
