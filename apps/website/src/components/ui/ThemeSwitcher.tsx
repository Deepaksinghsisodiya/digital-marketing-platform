"use client";

import React, { useState, useEffect } from "react";
import { Palette, X, Check } from "lucide-react";

const THEMES = [
  { id: "modern-growth", name: "Electric Indigo (Stripe/Linear)", color: "#6366F1", dark: true },
  { id: "dark-charcoal-neon-lime", name: "Cyberpunk Neon Lime", color: "#B6FF3C", dark: true },
  { id: "teal-coral", name: "Teal & Coral (Light Growth)", color: "#0D9488", dark: false },
  { id: "silicon-valley", name: "Silicon Valley Electric", color: "#4f46e5", dark: false },
  { id: "midnight-violet", name: "Midnight Violet Aurora", color: "#8b5cf6", dark: false },
  { id: "monochrome-stealth", name: "Laser Cobalt Blue", color: "#0055ff", dark: false },
  { id: "sapphire-ocean", name: "Sapphire Ocean Cyan", color: "#1d4ed8", dark: false },
  { id: "champagne-gold", name: "Executive Gold Obsidian", color: "#f59e0b", dark: false },
];

export const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("modern-growth");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const theme = html.getAttribute("data-theme");
      if (theme) setCurrentTheme(theme);
    }
  }, []);

  const switchTheme = (themeId: string) => {
    const html = document.documentElement;
    html.setAttribute("data-theme", themeId);

    const isDark = THEMES.find((t) => t.id === themeId)?.dark;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    setCurrentTheme(themeId);
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40">
      {/* Theme Selection Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-60 bg-card border border-border rounded-2xl shadow-2xl p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border">
            <span className="text-xs font-bold text-foreground">Global Theme Switcher</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-surface"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-muted px-2 pt-0.5">
            Instantly re-skin entire website from global.css tokens:
          </p>

          <div className="space-y-1 pt-1">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => switchTheme(theme.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                  currentTheme === theme.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-surface border border-transparent"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/50 shadow-xs shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-xs font-semibold text-foreground flex-1 truncate">
                  {theme.name}
                </span>
                {currentTheme === theme.id && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer border ${
          isOpen
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border text-foreground hover:border-primary/50 hover:shadow-primary/20"
        }`}
        aria-label="Switch theme preview"
        title="Switch theme"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
};
