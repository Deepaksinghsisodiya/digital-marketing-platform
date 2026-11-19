"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  size?: number;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = "rgba(var(--nexora-primary-rgb, 99 91 255), 0.14)",
  size = 350,
  className = "",
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [canEnhance, setCanEnhance] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // Only enable Tier 2 on fine pointer devices with adequate hardware concurrency
    if (typeof window !== "undefined") {
      const isFine = window.matchMedia("(pointer: fine)").matches;
      const isHighEnd = (navigator.hardwareConcurrency || 4) >= 4;
      setCanEnhance(isFine && isHighEnd && !prefersReduced);
    }
  }, [prefersReduced]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current || !canEnhance) return;
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [canEnhance],
  );

  const handleMouseEnter = useCallback(() => {
    if (canEnhance) setOpacity(1);
  }, [canEnhance]);

  const handleMouseLeave = useCallback(() => {
    if (canEnhance) setOpacity(0);
  }, [canEnhance]);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all ${className}`}
      {...props}
    >
      {canEnhance && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 -z-0"
          style={{
            opacity,
            background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
