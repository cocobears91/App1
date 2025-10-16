"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { clsx } from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { NotionStatusBadge } from "@/components/notion-status-badge";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  { href: "/", label: "Getting started", match: (path: string) => path === "/" },
  { href: "/upload", label: "Upload data", match: (path: string) => path.startsWith("/upload") },
  {
    href: "/status/demo-task",
    label: "Processing status",
    match: (path: string) => path.startsWith("/status"),
  },
  { href: "/clusters", label: "Cluster review", match: (path: string) => path.startsWith("/clusters") },
  {
    href: "/market-analysis",
    label: "Market analysis",
    match: (path: string) => path.startsWith("/market-analysis"),
  },
];

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user } = useAuth();
  const notionStatus = useAppStore((state) => state.notionStatus);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto w-full max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-500">Idea Intelligence Console</p>
              <h1 className="text-xl font-semibold">Innovation workflow</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotionStatusBadge status={notionStatus} />
              <ThemeToggle />
              {user && (
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
              )}
            </div>
          </div>
          <nav className="mt-4 grid gap-2 text-sm font-medium lg:hidden">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={`${item.href}-mobile`}
                  href={item.href}
                  className={clsx(
                    "rounded-lg px-4 py-2",
                    active
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "block rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 space-y-6 pb-16">{children}</main>
      </div>
    </div>
  );
}
