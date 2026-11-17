"use client";

import React, { createContext, useContext } from "react";
import { Reveal, type RevealProps } from "./Reveal";
import { MOTION_STAGGER } from "./motion-tokens";

interface StaggerContextValue {
  staggerMs: number;
}

const StaggerContext = createContext<StaggerContextValue>({
  staggerMs: MOTION_STAGGER,
});

export interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerMs?: number;
  children: React.ReactNode;
}

export const Stagger: React.FC<StaggerProps> = ({
  staggerMs = MOTION_STAGGER,
  children,
  className = "",
  ...rest
}) => {
  return (
    <StaggerContext.Provider value={{ staggerMs }}>
      <div className={className} {...rest}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
};

export interface StaggerItemProps extends RevealProps {
  index: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  index,
  delay: explicitDelay,
  ...rest
}) => {
  const { staggerMs } = useContext(StaggerContext);
  const calculatedDelay = explicitDelay !== undefined ? explicitDelay : index * staggerMs;

  return <Reveal delay={calculatedDelay} {...rest} />;
};
