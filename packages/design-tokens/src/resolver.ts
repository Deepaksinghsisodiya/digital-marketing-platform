import type { ThemeConfig } from "./types.js";
import { CYBER_EMERALD_PRESET, SYSTEM_THEME_PRESETS } from "./presets.js";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function resolveTheme(partialTheme?: DeepPartial<ThemeConfig> | null): ThemeConfig {
  if (!partialTheme) {
    return { ...CYBER_EMERALD_PRESET };
  }

  let basePreset: ThemeConfig = CYBER_EMERALD_PRESET;
  if (partialTheme.id || partialTheme.slug) {
    const found = SYSTEM_THEME_PRESETS.find(
      (p: ThemeConfig) => p.id === partialTheme.id || p.slug === partialTheme.slug
    );
    if (found) {
      basePreset = found;
    }
  }

  return {
    ...basePreset,
    ...partialTheme,
    id: partialTheme.id || basePreset.id,
    slug: partialTheme.slug || basePreset.slug,
    name: partialTheme.name || basePreset.name,
    tagline: partialTheme.tagline || basePreset.tagline,
    colors: {
      light: {
        ...basePreset.colors.light,
        ...(partialTheme.colors?.light || {}),
      },
      dark: {
        ...basePreset.colors.dark,
        ...(partialTheme.colors?.dark || {}),
      },
    },
    typography: {
      ...basePreset.typography,
      ...(partialTheme.typography || {}),
    },
    shape: {
      ...basePreset.shape,
      ...(partialTheme.shape || {}),
    },
    shadows: {
      ...basePreset.shadows,
      ...(partialTheme.shadows || {}),
    },
    gradients: {
      ...basePreset.gradients,
      ...(partialTheme.gradients || {}),
    },
    layout: {
      ...basePreset.layout,
      ...(partialTheme.layout || {}),
    },
    motion: {
      ...basePreset.motion,
      ...(partialTheme.motion || {}),
    },
    components: {
      ...basePreset.components,
      ...(partialTheme.components || {}),
    },
    admin: {
      ...basePreset.admin,
      ...(partialTheme.admin || {}),
    },
  };
}
