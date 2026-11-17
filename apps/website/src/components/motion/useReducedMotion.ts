"use client";

import { useEffect, useState } from "react";

/**
 * Checks system preferences (prefers-reduced-motion) and the site-wide
 * database-driven animation mode set via data-animation-mode attribute on <html>.
 */
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check system OS preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 2. Check html attribute set by SiteSettings / Theme Engine
    const checkMode = () => {
      const docAttr = document.documentElement.getAttribute("data-animation-mode");
      const isDbOffOrReduced = docAttr === "reduced" || docAttr === "off";
      setIsReduced(mediaQuery.matches || isDbOffOrReduced);
    };

    checkMode();

    const handleChange = () => checkMode();
    mediaQuery.addEventListener("change", handleChange);

    // Observe html data-animation-mode attribute mutations
    const observer = new MutationObserver(checkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-animation-mode"],
    });

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, []);

  return isReduced;
}

/**
 * Checks whether animations are completely turned off via DB setting.
 */
export function useAnimationOff(): boolean {
  const [isOff, setIsOff] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const docAttr = document.documentElement.getAttribute("data-animation-mode");
      setIsOff(docAttr === "off");
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-animation-mode"],
    });
    return () => observer.disconnect();
  }, []);

  return isOff;
}
