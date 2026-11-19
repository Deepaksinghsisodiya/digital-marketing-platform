"use client";

import React, { useMemo } from "react";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";

export interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerMs?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export const SplitText: React.FC<SplitTextProps> = ({
  children,
  className = "",
  delay = 0,
  staggerMs = 40,
  as: Component = "span",
}) => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, once: true });
  const prefersReduced = useReducedMotion();

  const words = useMemo(() => {
    return children.split(" ");
  }, [children]);

  if (prefersReduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref as React.Ref<never>} className={`inline-block ${className}`}>
      {words.map((word, idx) => {
        const wordDelay = delay + idx * staggerMs;
        return (
          <span
            key={`${word}-${idx}`}
            className="inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mr-[0.25em] last:mr-0"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translate3d(0, 0, 0)" : "translate3d(0, 16px, 0)",
              transitionDelay: `${wordDelay}ms`,
            }}
          >
            {word}
          </span>
        );
      })}
    </Component>
  );
};
