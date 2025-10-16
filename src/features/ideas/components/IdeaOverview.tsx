"use client";

import { ComponentProps } from "react";
import { IdeaDetail } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IdeaOverviewProps {
  idea: IdeaDetail;
}

const stageCopy: Record<IdeaDetail["stage"], { label: string; variant: ComponentProps<typeof Badge>["variant"] }> = {
  DRAFT: { label: "Draft", variant: "default" },
  REVIEW: { label: "In review", variant: "info" },
  PUBLISHED: { label: "Published", variant: "success" },
};

const signalTone: Record<IdeaDetail["marketSignals"][number]["strength"], ComponentProps<typeof Badge>["variant"]> = {
  WEAK: "warning",
  MEDIUM: "info",
  STRONG: "success",
};

export function IdeaOverview({ idea }: IdeaOverviewProps) {
  const stage = stageCopy[idea.stage];

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-500">Idea {idea.id}</p>
            <h1 className="text-2xl font-semibold">{idea.title}</h1>
          </div>
          <Badge variant={stage.variant}>{stage.label}</Badge>
        </div>

        {idea.persona && (
          <Badge variant="info" className="text-xs">
            Persona: {idea.persona}
          </Badge>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300">{idea.description}</p>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key insights</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {idea.insights.map((insight) => (
              <li key={insight} className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900">
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next recommendation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-200">{idea.recommendation}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Market signals</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {idea.marketSignals.map((signal) => (
              <Card key={signal.title} className="space-y-2 bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{signal.title}</p>
                  <Badge variant={signalTone[signal.strength]}>{signal.strength}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300">{signal.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {idea.notionPageUrl && (
          <Button asChild variant="secondary" size="sm">
            <a href={idea.notionPageUrl} target="_blank" rel="noreferrer">
              Open in Notion
            </a>
          </Button>
        )}
      </Card>
    </div>
  );
}
