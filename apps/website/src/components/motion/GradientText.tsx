"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = "",
  gradient,
}) => {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.1, once: true });

  return (
    <motion.span
      ref={ref as React.Ref<never>}
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          gradient ||
          "var(--nexora-gradient-brand, linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%))",
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
};
