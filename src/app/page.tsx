"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useAppStore } from "@/store/useAppStore";

const checklist = [
  {
    title: "Prepare your research",
    description: "Collect your customer interviews, sales notes, and existing brainstorm docs into a single zip archive.",
  },
  {
    title: "Upload and monitor",
    description: "We extract insights, cluster similar ideas, and sync everything to Notion for your stakeholders.",
  },
  {
    title: "Review clusters",
    description: "Approve the ideas that resonate, archive the noise, and request deeper market validation when needed.",
  },
];

const resources = [
  {
    label: "Upload zip archive",
    href: "/upload",
    description: "Guided upload flow with automatic background processing.",
  },
  {
    label: "Check processing status",
    href: "/status/demo-task",
    description: "Real-time progress tracking with Notion sync visibility.",
  },
  {
    label: "Review emerging clusters",
    href: "/clusters",
    description: "Moderate clusters, approve or archive, and escalate to the market team.",
  },
  {
    label: "See market analysis",
    href: "/market-analysis",
    description: "Executive-level summary of validated opportunities.",
  },
];

export default function HomePage() {
  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const dismiss = useAppStore((state) => state.dismissOnboarding);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4 bg-white/80 dark:bg-slate-900/60">
          <h2 className="text-2xl font-semibold">Welcome back, product team 👋</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This workspace guides non-technical stakeholders through the insight pipeline — from raw qualitative feedback to prioritised ideas with clear market evidence.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {checklist.map((item) => (
              <Card key={item.title} className="bg-slate-50/80 p-4 dark:bg-slate-900/40">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/upload">Start an upload</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/clusters">Jump to review</Link>
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 bg-blue-50/80 dark:bg-blue-600/20">
          <h3 className="text-lg font-semibold">Need a quick refresher?</h3>
          <p className="text-sm text-blue-900/80 dark:text-blue-100">
            Watch the two-minute overview to help your colleagues understand how the automation works and what decisions they need to make.
          </p>
          <Button variant="primary" asChild>
            <Link href="https://www.loom.com" target="_blank" rel="noreferrer">
              View onboarding video
            </Link>
          </Button>
          <Alert tone="info" className="text-xs leading-relaxed text-blue-900/80 dark:text-blue-100/90">
            Tip: you can always find these instructions again on the Getting started page.
          </Alert>
          {showOnboarding && (
            <Button variant="ghost" size="sm" onClick={dismiss} className="mt-2 self-start text-xs">
              I know the flow — hide tips
            </Button>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.href} className="flex flex-col gap-2 bg-white/80 p-5 dark:bg-slate-900/60">
              <div>
                <h3 className="text-base font-semibold">{resource.label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{resource.description}</p>
              </div>
              <Button asChild variant="secondary" size="sm" className="self-start">
                <Link href={resource.href}>Open</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
