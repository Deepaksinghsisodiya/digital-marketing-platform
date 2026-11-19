"use client";

import React from "react";
import { useScrollProgress } from "./useScrollProgress";
import { useReducedMotion } from "./useReducedMotion";

export const ScrollProgressBar: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const progress = useScrollProgress();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent pointer-events-none ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-75 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
        }}
      />
    </div>
  );
};
