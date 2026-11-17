/**
 * NEXORA MOTION TOKENS
 * Single source of truth for duration, easing, distance, and stagger across the application.
 * Hard Rule 6: No random per-component values.
 */

export const MOTION_DURATIONS = {
  fast: 150,     // Tooltips, subtle hover shifts
  normal: 250,   // Accordions, buttons, micro-interactions
  slow: 500,     // Card reveals, drawer transitions
  slower: 800,   // Apple / Stripe luxurious smooth section upward float
} as const;

export const MOTION_EASING = "cubic-bezier(0.16, 1, 0.3, 1)" as const; // Apple, Linear & Framer silky ease-out
export const MOTION_EASING_OUT = "cubic-bezier(0.16, 1, 0.3, 1)" as const;
export const MOTION_EASING_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)" as const;

export const MOTION_DISTANCES = {
  sm: 16,
  md: 28,
  lg: 44, // Clearly visible, graceful upward glide
} as const;

export const MOTION_STAGGER = 70; // ms stagger increment
