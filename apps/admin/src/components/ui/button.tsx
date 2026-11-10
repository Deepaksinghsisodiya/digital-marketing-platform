import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantStyles = {
      default:
        "bg-[color:var(--nexora-purple,#7657ff)] text-white hover:opacity-90",
      outline:
        "border border-[color:var(--nexora-border,#e6eafb)] bg-transparent hover:bg-[color:var(--nexora-paper,#f5f7ff)] text-[color:var(--nexora-ink,#17213d)]",
      secondary:
        "bg-[color:var(--nexora-paper,#f5f7ff)] text-[color:var(--nexora-ink,#17213d)] hover:opacity-80",
      ghost:
        "hover:bg-[color:var(--nexora-paper,#f5f7ff)] text-[color:var(--nexora-ink,#17213d)]",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8 text-base",
      icon: "h-9 w-9 p-0",
    }[size];

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantStyles,
          sizeStyles,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
