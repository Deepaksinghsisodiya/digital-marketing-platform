"use client";

import React from "react";
import { useInView } from "./useInView";
import { useReducedMotion, useAnimationOff } from "./useReducedMotion";
import { MOTION_DURATIONS, MOTION_EASING, MOTION_DISTANCES } from "./motion-tokens";

export type RevealVariant = "fade" | "fade-up" | "fade-left" | "scale";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  variant?: RevealVariant;
  delay?: number; // ms
  duration?: keyof typeof MOTION_DURATIONS;
  distance?: keyof typeof MOTION_DISTANCES;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * GPU-accelerated scroll reveal component.
 * Animates ONLY `transform` and `opacity`.
 * Respects prefers-reduced-motion and admin DB toggle.
 */
export const Reveal: React.FC<RevealProps> = ({
  variant = "fade-up",
  delay = 0,
  duration = "slow",
  distance = "md",
  threshold = 0.08,
  rootMargin = "0px 0px -30px 0px",
  once = true,
  as: Component = "div",
  className = "",
  style = {},
  children,
  ...rest
}) => {
  const [ref, inView] = useInView({ threshold, rootMargin, once });
  const isReduced = useReducedMotion();
  const isOff = useAnimationOff();

  const durationMs = MOTION_DURATIONS[duration];
  const distancePx = MOTION_DISTANCES[distance];

  // If animations are OFF or reduced-motion is requested: show immediately with no transform
  if (isOff || isReduced) {
    return (
      <Component
        ref={ref}
        className={className}
        style={{
          opacity: 1,
          transform: "none",
          ...style,
        }}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  // Calculate initial transform per variant
  let initialTransform = "none";
  if (!inView) {
    switch (variant) {
      case "fade-up":
        initialTransform = `translate3d(0, ${distancePx}px, 0)`;
        break;
      case "fade-left":
        initialTransform = `translate3d(${distancePx}px, 0, 0)`;
        break;
      case "scale":
        initialTransform = "scale(0.96)";
        break;
      case "fade":
      default:
        initialTransform = "none";
        break;
    }
  }

  const revealStyle: React.CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translate3d(0, 0, 0)" : initialTransform,
    transitionProperty: "opacity, transform",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: MOTION_EASING,
    transitionDelay: inView ? `${delay}ms` : "0ms",
    willChange: inView ? "auto" : "transform, opacity",
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={revealStyle}
      {...rest}
    >
      {children}
    </Component>
  );
};
