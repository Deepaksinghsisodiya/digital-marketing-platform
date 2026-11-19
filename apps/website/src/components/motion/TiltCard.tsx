"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTiltDeg?: number;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTiltDeg = 4,
  className = "",
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
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
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: -y * maxTiltDeg * 2,
        rotateY: x * maxTiltDeg * 2,
      });
    },
    [canEnhance, maxTiltDeg],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{
        transform: canEnhance
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
          : "none",
      }}
      {...props}
    >
      {children}
    </div>
  );
};
