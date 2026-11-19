"use client";

import React, { useId } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface AnimatedBeamProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curvature?: number;
  className?: string;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  startX,
  startY,
  endX,
  endY,
  curvature = 0,
  className = "",
}) => {
  const id = useId();
  const prefersReduced = useReducedMotion();

  // Cubic bezier control points for gentle curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + curvature;
  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  const gradientId = `beam-grad-${id.replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--nexora-primary)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="var(--nexora-accent)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--nexora-primary)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Base subtle guide line */}
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Animated glowing beam overlay */}
      {!prefersReduced && (
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="40 160"
          className="animate-beam-drift"
        />
      )}
    </svg>
  );
};
