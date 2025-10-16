import { clsx } from "clsx";
import { HTMLAttributes } from "react";

type AlertTone = "info" | "success" | "warning" | "error";

const classes: Record<AlertTone, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/25",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/25",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-500/25",
  error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/25",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

export function Alert({ tone = "info", className, ...rest }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx("rounded-lg border px-4 py-3 text-sm", classes[tone], className)}
      {...rest}
    />
  );
}
