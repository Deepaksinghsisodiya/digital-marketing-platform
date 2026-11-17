"use client";

import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * RAF-based count-up hook.
 * SSR renders the final target number immediately for zero SEO penalty and zero CLS.
 * Only triggers client-side count-up when triggered is true.
 */
export function useCountUp(
  target: number,
  durationMs = 1500,
  triggered = false,
  decimals = 0
): number {
  const isReduced = useReducedMotion();
  const [value, setValue] = useState<number>(() => target);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // If not triggered yet, or reduced motion, or already ran once, keep target
    if (!triggered || isReduced || hasRunRef.current) {
      if (isReduced) setValue(target);
      return;
    }

    hasRunRef.current = true;
    setValue(0);

    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Easing: cubic-bezier(0.22, 1, 0.36, 1) - custom ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = progress === 1 ? target : target * easeOut;

      const factor = Math.pow(10, decimals);
      setValue(Math.round(current * factor) / factor);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs, triggered, isReduced, decimals]);

  return value;
}
