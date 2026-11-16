import type { ThemeConfig } from "@nexora/design-tokens";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ConfigMutator = (config: ThemeConfig) => ThemeConfig;

export function parseThemeJson(
  json?: string | null,
): DeepPartial<ThemeConfig> | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as DeepPartial<ThemeConfig>)
      : null;
  } catch {
    return null;
  }
}

export function deepClone<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

export function getByPath(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in (acc as object)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
}

export function setByPath<T>(source: T, path: string, value: unknown): T {
  const clone = deepClone(source) as Record<string, unknown>;
  const keys = path.split(".");
  let cursor: Record<string, unknown> = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i]!;
    const next = cursor[key];
    if (!next || typeof next !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]!] = value;
  return clone as T;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
}

export function titleize(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export interface ColorContrastPair {
  label: string;
  foregroundPath: string;
  backgroundPath: string;
}

export const COLOR_CONTRAST_PAIRS: ColorContrastPair[] = [
  {
    label: "Primary button text",
    foregroundPath: "colors.primaryForeground",
    backgroundPath: "colors.primary",
  },
  {
    label: "Body text on background",
    foregroundPath: "colors.foreground",
    backgroundPath: "colors.background",
  },
  {
    label: "Card text",
    foregroundPath: "colors.cardForeground",
    backgroundPath: "colors.card",
  },
  {
    label: "Muted text on surface",
    foregroundPath: "colors.textMuted",
    backgroundPath: "colors.surface",
  },
  {
    label: "Link on background",
    foregroundPath: "colors.link",
    backgroundPath: "colors.background",
  },
];
