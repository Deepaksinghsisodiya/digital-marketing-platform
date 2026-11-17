"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface AnimatedButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Accessible button with standard motion micro-interactions:
 * - Active press scale: scale-[0.98]
 * - Arrow slide nudge on hover
 * - Focus-visible ring
 * - Motion reduce override
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  href,
  onClick,
  variant = "primary",
  size = "md",
  withArrow = true,
  className = "",
  children,
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-xl sm:rounded-2xl transition-all duration-200 select-none cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none";

  const sizeClasses = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-3.5 text-xs sm:text-sm gap-2",
    lg: "px-8 py-4 text-sm sm:text-base gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 motion-reduce:hover:translate-none",
    secondary:
      "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:-translate-y-0.5 motion-reduce:hover:translate-none",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:border-primary/40 shadow-xs hover:-translate-y-0.5 motion-reduce:hover:translate-none",
    ghost:
      "text-slate-700 hover:text-primary hover:bg-slate-100/60",
  }[variant];

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:translate-none" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${combinedClasses} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
