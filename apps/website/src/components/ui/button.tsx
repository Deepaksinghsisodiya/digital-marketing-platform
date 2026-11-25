import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40",
        gradient:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:opacity-95 hover:brightness-105",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-xs",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-xs",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700 p-0 h-auto",
        accent:
          "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs hover:bg-indigo-100",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11 p-0",
      },
      shape: {
        rounded: "rounded-lg",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  },
);

export interface ButtonProps
  extends
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
