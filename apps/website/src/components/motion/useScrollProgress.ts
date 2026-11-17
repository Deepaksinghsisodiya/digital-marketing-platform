"use client";

import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Calculates scroll progress (0 to 1) for the entire page or a target container element.
 * Respects prefers-reduced-motion.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  targetRef?: React.RefObject<T | null>
): number {
  const isReduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (isReduced || typeof window === "undefined") {
      setProgress(0);
      return;
    }

    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        if (targetRef && targetRef.current) {
          const el = targetRef.current;
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalHeight = rect.height;
          // Calculate when element enters to when it leaves
          const current = windowHeight - rect.top;
          const ratio = Math.max(0, Math.min(1, current / (totalHeight + windowHeight * 0.5)));
          setProgress(ratio);
        } else {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight =
            document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const ratio = scrollHeight > 0 ? Math.max(0, Math.min(1, scrollTop / scrollHeight)) : 0;
          setProgress(ratio);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isReduced, targetRef]);

  return progress;
}
