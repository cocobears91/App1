import { clsx } from "clsx";
import { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const styles: Record<BadgeVariant, string> = {
  default: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-100",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-100",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...rest }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", styles[variant], className)}
      {...rest}
    />
  );
}
