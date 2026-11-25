"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";

interface AnimatedHeadingProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4";
  delay?: number;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  children,
  className = "",
  as: Tag = "h2",
  delay = 0,
}) => {
  const [ref, inView] = useInView<HTMLHeadingElement>({ threshold: 0.1, once: true });
  const isReduced = useReducedMotion();

  if (isReduced) {
    return <Tag ref={ref as React.Ref<never>} className={className}>{children}</Tag>;
  }

  const words = children.split(" ");

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 20, filter: "blur(4px)" }
          }
          transition={{
            duration: 0.5,
            delay: delay + i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};
