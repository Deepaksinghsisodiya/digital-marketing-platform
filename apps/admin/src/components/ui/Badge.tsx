import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: "sm" | "default" | "lg";
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  default: {
    container:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80",
    dot: "bg-slate-500",
  },
  primary: {
    container:
      "bg-primary/10 text-primary dark:text-primary-foreground border-primary/20",
    dot: "bg-primary",
  },
  secondary: {
    container:
      "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  success: {
    container:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  warning: {
    container:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  danger: {
    container:
      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  info: {
    container:
      "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
  },
  outline: {
    container:
      "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
  },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  default: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-xs",
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  dot = false,
  pulse = false,
  size = "default",
  children,
  ...props
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none",
        currentVariant.container,
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            currentVariant.dot,
            pulse && "animate-pulse",
          )}
        />
      )}
      {children}
    </span>
  );
};
