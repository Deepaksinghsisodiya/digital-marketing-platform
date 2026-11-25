"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  as?: React.ElementType;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = "",
  speed = 0.25,
  as: Component = "div",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 40}px`, `${-speed * 40}px`]);

  if (isReduced) {
    return <Component ref={ref} className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref} className={className} style={{ position: "relative" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </Component>
  );
};
