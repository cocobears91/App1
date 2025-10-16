"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:bg-blue-300",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:bg-slate-100 disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 disabled:text-slate-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, asChild, ...rest }, ref) => {
    const Component = asChild ? Slot : "button";
    const componentProps = asChild
      ? { ...rest, "aria-disabled": disabled || isLoading }
      : { ...rest, disabled: disabled || isLoading };

    return (
      <Component
        ref={ref as never}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          variantClasses[variant],
          sizeClasses[size],
          className,
          (disabled || isLoading) && !asChild && "cursor-not-allowed opacity-70",
        )}
        {...componentProps}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
        )}
        <span>{children}</span>
      </Component>
    );
  },
);

Button.displayName = "Button";
