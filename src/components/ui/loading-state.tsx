import { clsx } from "clsx";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div className={clsx("flex items-center gap-3 text-sm text-slate-500", className)}>
      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      <span>{label}…</span>
    </div>
  );
}
