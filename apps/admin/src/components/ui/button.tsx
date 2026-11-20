import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "primary"
    | "outline"
    | "secondary"
    | "ghost"
    | "danger"
    | "destructive";
  size?: "default" | "sm" | "xs" | "lg" | "icon" | "icon-sm";
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      isLoading = false,
      disabled,
      icon: Icon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantStyles = {
      default:
        "bg-primary text-primary-foreground hover:opacity-90 shadow-xs shadow-primary/20",
      primary:
        "bg-primary text-primary-foreground hover:opacity-90 shadow-xs shadow-primary/20",
      outline:
        "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-xs shadow-red-600/20",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-xs shadow-red-600/20",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-3.5 py-2 text-xs",
      sm: "h-8 px-3 text-xs",
      xs: "h-7 px-2.5 text-[11px]",
      lg: "h-10 px-5 text-sm",
      icon: "h-9 w-9 p-0",
      "icon-sm": "h-8 w-8 p-0",
    }[size];

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles,
          sizeStyles,
          className,
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : Icon ? (
          <Icon className="w-3.5 h-3.5 shrink-0" />
        ) : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
