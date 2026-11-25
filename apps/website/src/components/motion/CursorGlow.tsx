"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";

interface CursorGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({
  children,
  className = "",
  glowColor = "rgba(var(--nexora-primary-rgb, 16 185 129) / 0.15)",
  glowSize = 280,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isReduced = useReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  if (isReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute rounded-full blur-3xl -z-0"
        animate={{
          x: position.x - glowSize / 2,
          y: position.y - glowSize / 2,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        style={{
          width: glowSize,
          height: glowSize,
          background: glowColor,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
