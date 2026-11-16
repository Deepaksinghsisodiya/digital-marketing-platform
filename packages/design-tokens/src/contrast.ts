import type { ContrastResult } from "./types.js";

/**
 * Parses a hex or rgb string into [r, g, b] numbers (0-255).
 */
export function parseColorToRgb(color: string): [number, number, number] | null {
  if (!color) return null;
  const trimmed = color.trim();

  // #fff or #ffffff or #ffffffff
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
    }
    return null;
  }

  // rgb(16, 185, 129) or rgba(16, 185, 129, 0.5)
  const rgbMatch = trimmed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  // "16 185 129" channel format
  const channelParts = trimmed.split(/\s+/).map((n) => parseInt(n, 10));
  if (
    channelParts.length >= 3 &&
    channelParts[0] !== undefined &&
    channelParts[1] !== undefined &&
    channelParts[2] !== undefined &&
    !isNaN(channelParts[0]) &&
    !isNaN(channelParts[1]) &&
    !isNaN(channelParts[2])
  ) {
    return [channelParts[0], channelParts[1], channelParts[2]];
  }

  return null;
}

/**
 * Calculates relative luminance as defined by W3C WCAG 2.1 specs.
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb;
  const rs = r / 255 <= 0.03928 ? r / 255 / 12.92 : Math.pow((r / 255 + 0.055) / 1.055, 2.4);
  const gs = g / 255 <= 0.03928 ? g / 255 / 12.92 : Math.pow((g / 255 + 0.055) / 1.055, 2.4);
  const bs = b / 255 <= 0.03928 ? b / 255 / 12.92 : Math.pow((b / 255 + 0.055) / 1.055, 2.4);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes contrast ratio (1:1 to 21:1) between foreground and background.
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColorToRgb(color1);
  const rgb2 = parseColorToRgb(color2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

/**
 * Checks WCAG contrast for key color combinations in a theme.
 */
export function evaluateThemeContrast(
  foreground: string,
  background: string,
  pairName: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7.0;

  return {
    pair: pairName,
    ratio,
    passesAA,
    passesAAA,
    level: passesAA ? "PASS" : ratio >= 3.0 ? "WARNING" : "FAIL",
  };
}
