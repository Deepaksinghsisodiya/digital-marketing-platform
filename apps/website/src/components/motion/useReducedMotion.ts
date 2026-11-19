"use client";

import { useSyncExternalStore } from "react";

let isReducedCached = false;
let isOffCached = false;
const listeners = new Set<() => void>();

let initialized = false;
function initMotionListeners() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => {
    const docAttr = document.documentElement.getAttribute("data-animation-mode");
    const isDbOffOrReduced = docAttr === "reduced" || docAttr === "off";
    isReducedCached = mediaQuery.matches || isDbOffOrReduced;
    isOffCached = docAttr === "off";
    listeners.forEach((l) => l());
  };

  update();
  mediaQuery.addEventListener("change", update);
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-animation-mode"],
  });
}

function subscribeMotion(callback: () => void) {
  initMotionListeners();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Checks system preferences (prefers-reduced-motion) and the site-wide
 * database-driven animation mode set via data-animation-mode attribute on <html>.
 * Uses a single unified listener via useSyncExternalStore.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => isReducedCached,
    () => false,
  );
}

/**
 * Checks whether animations are completely turned off via DB setting.
 * Uses a single unified listener via useSyncExternalStore.
 */
export function useAnimationOff(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => isOffCached,
    () => false,
  );
}
