import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { resolveTheme, themeToCss } from "@nexora/design-tokens";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  activeThemeSlug: string;
  refreshServerTheme: () => Promise<void>;
  applyThemeBySlug: (slug: string, customConfig?: unknown) => void;
}

interface PublicThemePayload {
  app: string;
  themeId: string;
  name: string;
  slug: string;
  schemaVersion: number;
  config: unknown;
  source: string;
  isDefault: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5201";

const THEME_STYLE_ID = "nexora-admin-theme-tokens";
const CACHE_KEY = "nexora_admin_theme_payload";
const CACHE_CSS_KEY = "nexora_admin_theme_css";
const CACHE_SLUG_KEY = "nexora_admin_theme_slug";

let lastResolvedTheme: ReturnType<typeof resolveTheme> | null = null;

function parseRgbChannels(colorStr: string): string {
  if (!colorStr) return "16 185 129";
  const hex = colorStr.trim().replace(/^#/, "");
  if (hex.length === 3 || hex.length === 6) {
    const full =
      hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const num = parseInt(full, 16);
    if (!isNaN(num)) {
      return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
    }
  }
  return "16 185 129";
}

function applyInlineStyles(
  resolved: ReturnType<typeof resolveTheme>,
  isDark: boolean,
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const colors = isDark ? resolved.colors.dark : resolved.colors.light;
  const primaryRgb = parseRgbChannels(colors.primary);
  const accentRgb = parseRgbChannels(colors.accent);

  root.style.setProperty("--nexora-primary", colors.primary);
  root.style.setProperty("--nexora-primary-rgb", primaryRgb);
  root.style.setProperty(
    "--nexora-primary-foreground",
    colors.primaryForeground || "#ffffff",
  );
  root.style.setProperty("--nexora-primary-hover", colors.primaryHover);
  root.style.setProperty("--nexora-primary-active", colors.primaryActive);
  root.style.setProperty("--nexora-secondary", colors.secondary);
  root.style.setProperty(
    "--nexora-secondary-rgb",
    parseRgbChannels(colors.secondary),
  );
  root.style.setProperty("--nexora-accent", colors.accent);
  root.style.setProperty("--nexora-accent-rgb", accentRgb);
  root.style.setProperty("--nexora-background", colors.background);
  root.style.setProperty(
    "--nexora-background-rgb",
    parseRgbChannels(colors.background),
  );
  root.style.setProperty("--nexora-foreground", colors.foreground);
  root.style.setProperty(
    "--nexora-foreground-rgb",
    parseRgbChannels(colors.foreground),
  );
  root.style.setProperty("--nexora-surface", colors.surface);
  root.style.setProperty(
    "--nexora-surface-rgb",
    parseRgbChannels(colors.surface),
  );
  root.style.setProperty(
    "--nexora-surface-elevated",
    colors.surfaceElevated || colors.surface,
  );
  root.style.setProperty("--nexora-card", colors.card);
  root.style.setProperty("--nexora-card-rgb", parseRgbChannels(colors.card));
  root.style.setProperty("--nexora-border", colors.border);
  root.style.setProperty("--nexora-ring", colors.ring);
  root.style.setProperty("--nexora-input", colors.input);
  root.style.setProperty("--nexora-purple", colors.primary);
  root.style.setProperty("--nexora-blue", colors.accent);
  root.style.setProperty("--nexora-cyan", colors.accent);
  root.style.setProperty("--nexora-emerald", colors.primary);
  root.style.setProperty("--nexora-teal", colors.accent);

  if (resolved.gradients?.gradientBrand) {
    root.style.setProperty(
      "--nexora-gradient-brand",
      resolved.gradients.gradientBrand,
    );
  }

  try {
    localStorage.setItem("nexora_admin_theme_primary", colors.primary);
    localStorage.setItem("nexora_admin_theme_primary_rgb", primaryRgb);
    localStorage.setItem("nexora_admin_theme_accent", colors.accent);
    localStorage.setItem("nexora_admin_theme_accent_rgb", accentRgb);
  } catch {
    // Ignore storage failures
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyServerTheme(payload: PublicThemePayload | null): string {
  const partialConfig =
    (payload?.config as Parameters<typeof resolveTheme>[0]) ??
    (payload?.themeId || payload?.slug
      ? ({
          id: payload.themeId || payload.slug,
          slug: payload.slug || payload.themeId,
        } as Parameters<typeof resolveTheme>[0])
      : null);
  const resolved = resolveTheme(partialConfig);
  lastResolvedTheme = resolved;
  const slug =
    resolved.slug || payload?.slug || payload?.themeId || "cyber-emerald";

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", slug);

    const isDark = root.classList.contains("dark");
    applyInlineStyles(resolved, isDark);

    let styleEl = document.getElementById(
      THEME_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = THEME_STYLE_ID;
    }
    const css = themeToCss(resolved, {
      mode: "both",
      scopeSelector: ":root, [data-theme], html",
    });
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  try {
    localStorage.setItem(
      CACHE_CSS_KEY,
      themeToCss(resolved, {
        mode: "both",
        scopeSelector: ":root, [data-theme], html",
      }),
    );
    localStorage.setItem(CACHE_SLUG_KEY, slug);
  } catch {
    // Ignore storage failures; live CSS has still been applied.
  }

  return slug;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("nexora_admin_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return "dark"; // Default to dark for modern SaaS admin
  });
  const [activeThemeSlug, setActiveThemeSlug] = useState<string>("cyber-emerald");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nexora_admin_theme", theme);
    if (lastResolvedTheme) {
      applyInlineStyles(lastResolvedTheme, isDark);
    }
  }, [theme]);

  const applyThemeBySlug = useCallback((slug: string, customConfig?: unknown) => {
    const config =
      customConfig ?? { id: slug, slug };
    const appliedSlug = applyServerTheme({
      app: "admin",
      themeId: slug,
      name: slug,
      slug,
      schemaVersion: 1,
      config,
      source: "local-apply",
      isDefault: false,
    });
    setActiveThemeSlug(appliedSlug);
  }, []);

  const refreshServerTheme = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/theme?app=admin&_t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) return;
      const payload = (await res.json()) as PublicThemePayload;
      const slug = applyServerTheme(payload);
      setActiveThemeSlug(slug);
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Keep the last known / cached theme on network failure.
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const payload = JSON.parse(cached) as PublicThemePayload;
        setActiveThemeSlug(applyServerTheme(payload));
      } catch {
        // Ignore malformed cache, the network request below will recover.
      }
    }
    void refreshServerTheme();

    const handleFocus = () => void refreshServerTheme();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshServerTheme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        activeThemeSlug,
        refreshServerTheme,
        applyThemeBySlug,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
