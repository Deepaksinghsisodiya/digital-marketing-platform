"use client";

import React from "react";
import { useScrollProgress } from "./useScrollProgress";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Top reading progress indicator for long-form content.
 * Animates strictly transform: scaleX, 0 CLS.
 */
export const ReadingProgressBar: React.FC = () => {
  const progress = useScrollProgress();
  const isReduced = useReducedMotion();

  if (isReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400"
        style={{
          transform: `scaleX(${progress})`,
          transformOrigin: "left center",
          willChange: "transform",
        }}
      />
    </div>
  );
};
