"use client";

import React, { useMemo } from "react";
import { useInView } from "./useInView";
import { useCountUp } from "./useCountUp";
import { useReducedMotion } from "./useReducedMotion";

export interface CountUpProps {
  value: string | number;
  durationMs?: number;
  className?: string;
}

/**
 * Extracts prefix, numeric value, suffix, and decimal count from a string like:
 * "$120M+", "340%", "4.8x", "99.8%", "₹50L+".
 */
function parseNumericValue(raw: string | number) {
  if (typeof raw === "number") {
    return { prefix: "", num: raw, suffix: "", decimals: Number.isInteger(raw) ? 0 : 1 };
  }

  const str = raw.trim();
  const match = str.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);

  if (!match) {
    return { prefix: "", num: 0, suffix: str, decimals: 0 };
  }

  const prefix = match[1] || "";
  const numStr = match[2] || "0";
  const suffix = match[3] || "";
  const num = parseFloat(numStr);
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;

  return { prefix, num, suffix, decimals };
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  durationMs = 1500,
  className = "",
}) => {
  const [ref, inView] = useInView({ threshold: 0.2, once: true });
  const isReduced = useReducedMotion();

  const { prefix, num, suffix, decimals } = useMemo(
    () => parseNumericValue(value),
    [value]
  );

  const currentCount = useCountUp(num, durationMs, inView, decimals);

  // If reduced motion is requested or num is 0: show verified string directly
  if (isReduced || isNaN(num) || num === 0) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  const formattedNumber = currentCount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {`${prefix}${formattedNumber}${suffix}`}
    </span>
  );
};
