/**
 * NEXORA MOTION TOKENS
 * Single source of truth for duration, easing, distance, and stagger across the application.
 * Hard Rule 6: No random per-component values.
 */

export const MOTION_DURATIONS = {
  fast: 150,     // Tooltips, subtle hover shifts
  normal: 250,   // Accordions, buttons, micro-interactions
  slow: 500,     // Card reveals, drawer transitions
  slower: 700,   // Hero elements, section reveals
} as const;

export const MOTION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)" as const;
export const MOTION_EASING_OUT = "cubic-bezier(0.22, 1, 0.36, 1)" as const;
export const MOTION_EASING_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)" as const;

export const MOTION_DISTANCES = {
  sm: 12,
  md: 18,
  lg: 24,
} as const;

export const MOTION_STAGGER = 70; // ms stagger increment
