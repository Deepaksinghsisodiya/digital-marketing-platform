"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 16,
  className = "",
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canEnhance, setCanEnhance] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isFine = window.matchMedia("(pointer: fine)").matches;
      setCanEnhance(isFine && !prefersReduced);
    }
  }, [prefersReduced]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || !canEnhance) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      // Max displacement capped at 6px for subtlety
      const x = Math.max(-6, Math.min(6, (e.clientX - centerX) / strength));
      const y = Math.max(-6, Math.min(6, (e.clientY - centerY) / strength));
      setOffset({ x, y });
    },
    [canEnhance, strength],
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{
        transform: canEnhance
          ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
          : "none",
      }}
      {...props}
    >
      {children}
    </div>
  );
};
