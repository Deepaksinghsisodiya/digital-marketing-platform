"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 2,
  decimals = 0,
}) => {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.3, once: true });
  const isReduced = useReducedMotion();
  const springValue = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(springValue, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (inView && !isReduced) {
      springValue.set(value);
    } else if (isReduced) {
      springValue.jump(value);
    }
  }, [inView, value, springValue, isReduced]);

  if (isReduced) {
    return (
      <span ref={ref as React.Ref<never>} className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    );
  }

  return (
    <motion.span ref={ref as React.Ref<never>} className={className}>
      {display}
    </motion.span>
  );
};
