"use client";

import React, { useRef } from "react";
import { useScrollProgress } from "./useScrollProgress";
import { useReducedMotion } from "./useReducedMotion";

export interface ProgressLineProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
  targetRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Scroll-linked animated progress line for timelines and reading indicators.
 * Animates ONLY transform (scaleY or scaleX) with GPU acceleration and zero layout shift.
 */
export const ProgressLine: React.FC<ProgressLineProps> = ({
  orientation = "vertical",
  className = "",
  targetRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = targetRef || containerRef;
  const progress = useScrollProgress(activeRef);
  const isReduced = useReducedMotion();

  const isVertical = orientation === "vertical";
  const scale = isReduced ? 1 : Math.min(Math.max(progress, 0), 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-200/50 ${
        isVertical ? "w-0.5 h-full" : "h-0.5 w-full"
      } ${className}`}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary via-emerald-400 to-cyan-400"
        style={{
          transform: isVertical ? `scaleY(${scale})` : `scaleX(${scale})`,
          transformOrigin: isVertical ? "top center" : "left center",
          willChange: isReduced ? "auto" : "transform",
          transition: "transform 100ms linear",
        }}
      />
    </div>
  );
};
