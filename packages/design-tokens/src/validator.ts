import type { ThemeConfig } from "./types.js";
import { parseColorToRgb } from "./contrast.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isSafeColor(color: unknown): boolean {
  if (typeof color !== "string") return false;
  const trimmed = color.trim();
  if (trimmed.length > 50) return false;
  if (/[<>{}\\]/.test(trimmed)) return false;
  if (/javascript:|expression\(/i.test(trimmed)) return false;
  return parseColorToRgb(trimmed) !== null;
}

function isSafeString(val: unknown, maxLen = 200): boolean {
  if (typeof val !== "string") return false;
  if (val.length > maxLen) return false;
  return !/[<>{}\\]/.test(val) && !/javascript:|expression\(/i.test(val);
}

export function validateTheme(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Theme configuration must be an object."] };
  }

  try {
    const serialized = JSON.stringify(input);
    if (serialized.length > 256 * 1024) {
      return { valid: false, errors: ["Theme payload exceeds maximum size limit (256 KB)."] };
    }
  } catch {
    return { valid: false, errors: ["Theme payload cannot be serialized to JSON."] };
  }

  const theme = input as Partial<ThemeConfig>;

  if (!theme.name || !isSafeString(theme.name, 100)) {
    errors.push("Theme name is required and must be under 100 characters.");
  }

  if (theme.slug && !/^[a-z0-9-]+$/.test(theme.slug)) {
    errors.push("Theme slug must contain only lowercase alphanumeric characters and hyphens.");
  }

  if (theme.colors) {
    if (theme.colors.light) {
      if (theme.colors.light.primary && !isSafeColor(theme.colors.light.primary)) {
        errors.push("Light primary color must be a valid hex or rgb color string.");
      }
      if (theme.colors.light.background && !isSafeColor(theme.colors.light.background)) {
        errors.push("Light background color must be a valid hex or rgb color string.");
      }
    }
    if (theme.colors.dark) {
      if (theme.colors.dark.primary && !isSafeColor(theme.colors.dark.primary)) {
        errors.push("Dark primary color must be a valid hex or rgb color string.");
      }
      if (theme.colors.dark.background && !isSafeColor(theme.colors.dark.background)) {
        errors.push("Dark background color must be a valid hex or rgb color string.");
      }
    }
  }

  if (theme.typography) {
    if (theme.typography.fontSans && !isSafeString(theme.typography.fontSans, 200)) {
      errors.push("Typography fontSans contains unsafe characters.");
    }
    if (theme.typography.fontHeading && !isSafeString(theme.typography.fontHeading, 200)) {
      errors.push("Typography fontHeading contains unsafe characters.");
    }
  }

  if (theme.shape) {
    for (const [key, val] of Object.entries(theme.shape)) {
      if (typeof val === "string" && !/^[0-9.]+(px|rem|em|%|px)$|^9999px$/.test(val.trim())) {
        errors.push(`Shape property ${key} has invalid dimension format: ${val}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
