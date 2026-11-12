"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  reverse?: boolean;
  children: React.ReactNode;
}

export const Marquee: React.FC<MarqueeProps> = ({
  speed = "normal",
  pauseOnHover = true,
  reverse = false,
  className,
  children,
  ...props
}) => {
  const durationClass = {
    slow: "duration-[45s]",
    normal: "duration-[30s]",
    fast: "duration-[18s]",
  }[speed];

  return (
    <div
      className={cn(
        "group flex overflow-hidden p-2 [--gap:2rem] [gap:var(--gap)] select-none",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full animate-marquee",
          durationClass,
          reverse && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full animate-marquee",
          durationClass,
          reverse && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
    </div>
  );
};
