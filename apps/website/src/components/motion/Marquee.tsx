"use client";

import React from "react";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  speedSec?: number;
  gap?: string;
  children: React.ReactNode;
}

/**
 * Pure CSS infinite marquee.
 * Pauses on hover, focus, and respects prefers-reduced-motion.
 * Duplicate track has aria-hidden="true" for screen reader accessibility.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  reverse = false,
  pauseOnHover = true,
  speedSec = 35,
  gap = "2rem",
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`group flex overflow-hidden select-none relative ${className}`}
      style={
        {
          "--gap": gap,
          "--duration": `${speedSec}s`,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div
        className={`flex shrink-0 items-center justify-around gap-(--gap) min-w-full ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]" : ""} motion-reduce:[animation:none]`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-around gap-(--gap) min-w-full ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]" : ""} motion-reduce:[animation:none]`}
      >
        {children}
      </div>
    </div>
  );
};
