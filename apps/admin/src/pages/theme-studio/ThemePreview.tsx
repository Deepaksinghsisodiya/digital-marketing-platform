import React, { useEffect, useRef, useState } from "react";
import type { ThemeConfig } from "@nexora/design-tokens";
import { themeToCss } from "@nexora/design-tokens";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Globe,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export type PreviewViewport = "desktop" | "tablet" | "mobile";
export type PreviewMode = "light" | "dark";
export type PreviewSurface = "admin" | "website" | "components";

function buildAdminPreviewDocument(
  theme: ThemeConfig,
  mode: PreviewMode,
): string {
  const css = themeToCss(theme, { mode: "both" });

  return `<!doctype html>
<html class="${mode === "dark" ? "dark" : ""}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${css}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--nexora-background);
  color: var(--nexora-foreground);
  font-family: var(--nexora-font-sans, Inter, sans-serif);
  font-size: 13px;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.shell { display: flex; min-height: 100vh; }
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--nexora-admin-sidebar-bg, #0d1422);
  border-right: 1px solid var(--nexora-admin-sidebar-border, rgba(255,255,255,0.08));
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #fff;
}
.brand {
  display: flex; align-items: center; gap: 8px;
  font-weight: 800;
  font-family: var(--nexora-font-heading, sans-serif);
  font-size: 14px;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
.brand-icon {
  width: 24px; height: 24px; border-radius: 8px;
  background: var(--nexora-primary);
  display: flex; align-items: center; justify-content: center;
  color: var(--nexora-primary-foreground);
  font-weight: 900; font-size: 12px;
  box-shadow: 0 0 14px var(--nexora-glow);
}
.nav-link {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border-radius: var(--nexora-radius-md, 8px);
  color: var(--nexora-text-muted, #94a3b8);
  font-size: 12px; font-weight: 600;
  transition: all 0.15s ease;
}
.nav-link.active {
  background: var(--nexora-admin-sidebar-active-item, rgba(255,255,255,0.1));
  color: #fff;
  border-left: 3px solid var(--nexora-primary);
}
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar {
  height: 52px;
  background: var(--nexora-surface);
  border-bottom: 1px solid var(--nexora-border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
}
.topbar h2 {
  font-family: var(--nexora-font-heading);
  font-size: 15px; font-weight: 800;
  letter-spacing: -0.02em;
}
.topbar-actions { display: flex; items-center; gap: 8px; }
.content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.hero-banner {
  border-radius: var(--nexora-radius-xl, 14px);
  background: var(--nexora-gradient-brand, linear-gradient(135deg, var(--nexora-primary), var(--nexora-accent)));
  color: #ffffff;
  padding: 22px 24px;
  box-shadow: 0 12px 28px -6px var(--nexora-glow, rgba(0,0,0,0.18));
  display: flex; justify-content: space-between; align-items: center;
}
.hero-banner h1 {
  font-family: var(--nexora-font-heading);
  font-size: 19px; font-weight: 900; letter-spacing: -0.02em;
  margin-bottom: 4px; color: #fff;
}
.hero-banner p { font-size: 12px; opacity: 0.92; color: #fff; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card {
  background: var(--nexora-card);
  border: 1px solid var(--nexora-border);
  border-radius: var(--nexora-card-radius, 12px);
  padding: 14px 16px;
  box-shadow: var(--nexora-shadow-sm);
}
.stat-label { font-size: 11px; font-weight: 700; color: var(--nexora-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-family: var(--nexora-font-heading); font-size: 20px; font-weight: 800; margin: 6px 0 2px; }
.stat-trend { font-size: 11px; font-weight: 700; color: var(--nexora-success); display: flex; align-items: center; gap: 4px; }
.table-panel {
  background: var(--nexora-card);
  border: 1px solid var(--nexora-border);
  border-radius: var(--nexora-card-radius, 12px);
  padding: 16px;
  box-shadow: var(--nexora-shadow-sm);
}
.table-title { font-size: 13px; font-weight: 800; margin-bottom: 12px; font-family: var(--nexora-font-heading); }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { text-align: left; padding: 8px 10px; color: var(--nexora-text-muted); font-size: 11px; text-transform: uppercase; border-bottom: 1px solid var(--nexora-border); }
td { padding: 9px 10px; border-bottom: 1px solid var(--nexora-border); }
.btn {
  border: none; cursor: pointer;
  font-weight: 700; font-size: 11px; padding: 7px 14px;
  border-radius: var(--nexora-button-radius, 8px);
  display: inline-flex; align-items: center; gap: 6px;
  transition: all 0.2s ease;
}
.btn-primary {
  background: var(--nexora-primary);
  color: var(--nexora-primary-foreground);
  box-shadow: 0 4px 12px -2px var(--nexora-glow);
}
.btn-accent { background: var(--nexora-accent); color: var(--nexora-accent-foreground); }
.btn-outline { background: transparent; border: 1px solid var(--nexora-border); color: var(--nexora-foreground); }
.badge { display: inline-flex; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; }
.badge-live { background: color-mix(in srgb, var(--nexora-success) 18%, transparent); color: var(--nexora-success); border: 1px solid color-mix(in srgb, var(--nexora-success) 35%, transparent); }
</style>
</head>
<body>
<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-icon">N</div>
      <span>${theme.name || "Nexora Platform"}</span>
    </div>
    <div class="nav-link active"><span>●</span> Dashboard</div>
    <div class="nav-link"><span>○</span> Campaigns</div>
    <div class="nav-link"><span>○</span> CMS Pages</div>
    <div class="nav-link"><span>○</span> Analytics</div>
    <div class="nav-link"><span>○</span> Leads Inbox</div>
    <div class="nav-link"><span>○</span> Settings</div>
  </aside>
  <main class="main">
    <header class="topbar">
      <h2>Executive Overview</h2>
      <div class="topbar-actions">
        <span class="badge badge-live">Live System</span>
        <button class="btn btn-primary">+ New Campaign</button>
      </div>
    </header>
    <div class="content">
      <div class="hero-banner">
        <div>
          <h1>Engineering Digital Growth</h1>
          <p>${theme.tagline || "Enterprise multi-touch attribution & deterministic performance."}</p>
        </div>
        <button class="btn btn-primary" style="background:#fff; color:#0f172a; font-weight:800;">View Report &rarr;</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Pipeline ARR</div>
          <div class="stat-value">$1,248,500</div>
          <div class="stat-trend">&uarr; +18.4% MoM</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Conversion Rate</div>
          <div class="stat-value">7.92%</div>
          <div class="stat-trend">&uarr; +1.4 pts</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Qualified Leads</div>
          <div class="stat-value">3,482</div>
          <div class="stat-trend">&uarr; +12.1% MoM</div>
        </div>
      </div>
      <div class="table-panel">
        <div class="table-title">Performance by Channel</div>
        <table>
          <thead><tr><th>Channel</th><th>Sessions</th><th>Conversions</th><th>ROAS</th></tr></thead>
          <tbody>
            <tr><td><strong>Organic High-Intent</strong></td><td>18,400</td><td>1,126</td><td><span style="color:var(--nexora-primary); font-weight:800;">4.8x</span></td></tr>
            <tr><td><strong>Google Paid Search</strong></td><td>9,850</td><td>642</td><td><span style="color:var(--nexora-primary); font-weight:800;">3.2x</span></td></tr>
            <tr><td><strong>LinkedIn B2B Ads</strong></td><td>6,110</td><td>903</td><td><span style="color:var(--nexora-primary); font-weight:800;">7.1x</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>
</body>
</html>`;
}

function buildWebsitePreviewDocument(
  theme: ThemeConfig,
  mode: PreviewMode,
): string {
  const css = themeToCss(theme, { mode: "both" });

  return `<!doctype html>
<html class="${mode === "dark" ? "dark" : ""}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${css}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--nexora-navy, #080c14);
  color: #ffffff;
  font-family: var(--nexora-font-sans, Inter, sans-serif);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.navbar {
  height: 56px;
  background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
}
.brand { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15px; }
.brand-badge {
  width: 26px; height: 26px; border-radius: 8px;
  background: var(--nexora-primary); color: var(--nexora-primary-foreground);
  display: flex; align-items: center; justify-content: center; font-weight: 900;
  box-shadow: 0 0 16px var(--nexora-glow);
}
.nav-menu { display: flex; gap: 18px; font-size: 12px; font-weight: 600; color: #94a3b8; }
.nav-menu a { color: inherit; text-decoration: none; }
.nav-menu a:hover { color: var(--nexora-primary); }
.hero-section {
  padding: 48px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.hero-glow {
  position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
  width: 500px; height: 260px;
  background: var(--nexora-glow, rgba(16, 185, 129, 0.25));
  filter: blur(90px); border-radius: 999px; pointer-events: none;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 14px; border-radius: 999px;
  background: color-mix(in srgb, var(--nexora-primary) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--nexora-primary) 35%, transparent);
  color: var(--nexora-primary); font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em;
}
.headline {
  font-family: var(--nexora-font-heading, sans-serif);
  font-size: 28px; font-weight: 900; line-height: 1.15;
  letter-spacing: -0.03em; max-width: 520px;
}
.subhead {
  font-size: 13px; color: #94a3b8; max-width: 440px; line-height: 1.5;
}
.cta-group { display: flex; gap: 10px; margin-top: 8px; }
.btn-cta {
  background: var(--nexora-primary);
  color: var(--nexora-primary-foreground);
  font-weight: 800; font-size: 12px; padding: 10px 20px;
  border-radius: var(--nexora-button-radius, 10px);
  border: none; cursor: pointer;
  box-shadow: 0 8px 24px -4px var(--nexora-glow);
}
.btn-secondary {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-weight: 700; font-size: 12px; padding: 10px 18px;
  border-radius: var(--nexora-button-radius, 10px); cursor: pointer;
}
.features-strip {
  display: flex; justify-content: center; gap: 20px;
  font-size: 11px; color: #cbd5e1; margin-top: 14px;
}
.feature-item { display: flex; align-items: center; gap: 5px; }
.feature-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--nexora-primary); }
</style>
</head>
<body>
<nav class="navbar">
  <div class="brand">
    <div class="brand-badge">N</div>
    <span>Nexora Digital</span>
  </div>
  <div class="nav-menu">
    <a href="#">Services</a>
    <a href="#">Industries</a>
    <a href="#">Case Studies</a>
    <a href="#">Insights</a>
  </div>
  <button class="btn-cta" style="padding:7px 14px; font-size:11px;">Let's Talk &rarr;</button>
</nav>
<main class="hero-section">
  <div class="hero-glow"></div>
  <div class="eyebrow">Enterprise Digital Growth Engine</div>
  <h1 class="headline">Technology Meets Creativity. Growth Becomes Reality.</h1>
  <p class="subhead">${theme.tagline || "We engineer deterministic B2B growth engines: SEO, acquisition, and full-funnel attribution."}</p>
  <div class="cta-group">
    <button class="btn-cta">Start Your Project &rarr;</button>
    <button class="btn-secondary">Explore Stack</button>
  </div>
  <div class="features-strip">
    <div class="feature-item"><span class="feature-dot"></span> Next.js 15</div>
    <div class="feature-item"><span class="feature-dot"></span> React 19</div>
    <div class="feature-item"><span class="feature-dot"></span> WCAG 2.2 AA</div>
    <div class="feature-item"><span class="feature-dot"></span> Dynamic Tokens</div>
  </div>
</main>
</body>
</html>`;
}

function buildComponentsPreviewDocument(
  theme: ThemeConfig,
  mode: PreviewMode,
): string {
  const css = themeToCss(theme, { mode: "both" });

  return `<!doctype html>
<html class="${mode === "dark" ? "dark" : ""}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${css}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--nexora-background);
  color: var(--nexora-foreground);
  font-family: var(--nexora-font-sans, Inter, sans-serif);
  padding: 20px; font-size: 13px;
  -webkit-font-smoothing: antialiased;
}
.section { margin-bottom: 20px; }
.section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--nexora-text-muted); margin-bottom: 10px; letter-spacing: 0.05em; }
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.btn {
  border: none; cursor: pointer;
  font-weight: 700; font-size: 12px; padding: 8px 16px;
  border-radius: var(--nexora-button-radius, 8px);
  transition: all 0.2s;
}
.btn-primary { background: var(--nexora-primary); color: var(--nexora-primary-foreground); box-shadow: 0 4px 14px -2px var(--nexora-glow); }
.btn-accent { background: var(--nexora-accent); color: var(--nexora-accent-foreground); }
.btn-secondary { background: var(--nexora-secondary); color: var(--nexora-secondary-foreground); }
.btn-outline { background: transparent; border: 1px solid var(--nexora-border); color: var(--nexora-foreground); }
.btn-ghost { background: transparent; color: var(--nexora-primary); }
.swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.swatch {
  border-radius: 10px; padding: 10px;
  border: 1px solid var(--nexora-border);
  display: flex; flex-direction: column; gap: 4px;
}
.swatch-box { height: 32px; border-radius: 6px; }
.swatch-name { font-size: 10px; font-weight: 700; color: var(--nexora-text-muted); }
.badges { display: flex; gap: 8px; flex-wrap: wrap; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.badge-p { background: var(--nexora-primary); color: var(--nexora-primary-foreground); }
.badge-a { background: var(--nexora-accent); color: var(--nexora-accent-foreground); }
.badge-s { background: var(--nexora-success); color: #fff; }
.badge-w { background: var(--nexora-warning); color: #000; }
.badge-d { background: var(--nexora-danger); color: #fff; }
.input-field {
  width: 100%; max-width: 320px; padding: 9px 12px; font-size: 13px;
  border-radius: var(--nexora-input-radius, 8px);
  border: 1px solid var(--nexora-border);
  background: var(--nexora-surface-elevated, var(--nexora-card));
  color: var(--nexora-foreground); outline: none;
}
.input-field:focus { border-color: var(--nexora-ring); box-shadow: 0 0 0 2px color-mix(in srgb, var(--nexora-ring) 25%, transparent); }
</style>
</head>
<body>
<div class="section">
  <div class="section-title">Buttons & Action Elements</div>
  <div class="row">
    <button class="btn btn-primary">Primary Action</button>
    <button class="btn btn-accent">Accent Focus</button>
    <button class="btn btn-secondary">Secondary</button>
    <button class="btn btn-outline">Outline</button>
    <button class="btn btn-ghost">Ghost Link</button>
  </div>
</div>
<div class="section">
  <div class="section-title">Color System & Tokens</div>
  <div class="swatches">
    <div class="swatch">
      <div class="swatch-box" style="background:var(--nexora-primary);"></div>
      <span class="swatch-name">Primary</span>
    </div>
    <div class="swatch">
      <div class="swatch-box" style="background:var(--nexora-accent);"></div>
      <span class="swatch-name">Accent</span>
    </div>
    <div class="swatch">
      <div class="swatch-box" style="background:var(--nexora-surface);"></div>
      <span class="swatch-name">Surface</span>
    </div>
    <div class="swatch">
      <div class="swatch-box" style="background:var(--nexora-card);"></div>
      <span class="swatch-name">Card</span>
    </div>
  </div>
</div>
<div class="section">
  <div class="section-title">Status Badges & Form Controls</div>
  <div class="badges" style="margin-bottom:12px;">
    <span class="badge badge-p">Primary</span>
    <span class="badge badge-a">Accent</span>
    <span class="badge badge-s">Active</span>
    <span class="badge badge-w">Draft</span>
    <span class="badge badge-d">Danger</span>
  </div>
  <input class="input-field" placeholder="Focus to test theme ring token..." />
</div>
</body>
</html>`;
}

export const ThemePreview: React.FC<{
  theme: ThemeConfig;
  viewport: PreviewViewport;
  mode: PreviewMode;
  revision: number;
  surface?: PreviewSurface;
  onSurfaceChange?: (surface: PreviewSurface) => void;
  onViewportChange?: (viewport: PreviewViewport) => void;
  onModeChange?: (mode: PreviewMode) => void;
  onFullscreen?: () => void;
}> = ({
  theme,
  viewport,
  mode,
  revision,
  surface = "admin",
  onSurfaceChange,
  onViewportChange,
  onModeChange,
  onFullscreen,
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(480);
  const [internalSurface, setInternalSurface] = useState<PreviewSurface>(surface);
  const activeSurface = onSurfaceChange ? surface : internalSurface;

  const handleSetSurface = (s: PreviewSurface) => {
    if (onSurfaceChange) onSurfaceChange(s);
    else setInternalSurface(s);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 480);
      }
    };
    updateSize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateSize);
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    let doc = "";
    if (activeSurface === "website") {
      doc = buildWebsitePreviewDocument(theme, mode);
    } else if (activeSurface === "components") {
      doc = buildComponentsPreviewDocument(theme, mode);
    } else {
      doc = buildAdminPreviewDocument(theme, mode);
    }

    if (frameRef.current) {
      frameRef.current.srcdoc = doc;
    }
  }, [theme, mode, revision, activeSurface]);

  // Dynamic Scale Calculations to fit available width perfectly
  const isDesktop = viewport === "desktop";
  const isTablet = viewport === "tablet";
  const isMobile = viewport === "mobile";

  const availableWidth = Math.max(300, containerWidth - 28);
  const desktopScale = Math.max(0.28, Math.min(0.55, availableWidth / 1024));
  const tabletScale = Math.max(0.35, Math.min(0.62, availableWidth / 768));
  const mobileScale = Math.max(0.55, Math.min(0.88, Math.min(availableWidth, 340) / 375));

  return (
    <div className="flex flex-col h-full w-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* 1. Header Toolbar: Surface Switcher, Device Bezels, Mode Switcher */}
      <div className="border-b border-border bg-surface px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Surface Tabs: Admin vs Website vs UI Kit */}
        <div className="flex items-center gap-1 rounded-xl bg-card p-1 border border-border">
          <button
            type="button"
            onClick={() => handleSetSurface("admin")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeSurface === "admin"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetSurface("website")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeSurface === "website"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>Website</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetSurface("components")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeSurface === "components"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>UI Kit</span>
          </button>
        </div>

        {/* Viewport & Theme Mode Controls */}
        <div className="flex items-center gap-2">
          {onViewportChange ? (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              {(["desktop", "tablet", "mobile"] as PreviewViewport[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={option}
                  onClick={() => onViewportChange(option)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                    viewport === option
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          {onModeChange ? (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              {(["light", "dark"] as PreviewMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={option}
                  onClick={() => onModeChange(option)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                    mode === option
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          {onFullscreen ? (
            <button
              type="button"
              onClick={onFullscreen}
              title="Fullscreen Preview"
              className="p-1.5 rounded-xl border border-border bg-card text-muted hover:text-foreground hover:bg-surface transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. Scaled Device Canvas Container with dynamic width auto-fit */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[460px] p-3 flex items-center justify-center bg-slate-900/5 dark:bg-black/40 overflow-hidden"
      >
        {isDesktop ? (
          /* MacOS-style Scaled Desktop Browser Frame */
          <div
            className="flex flex-col rounded-xl border border-border/80 shadow-2xl bg-card overflow-hidden transition-all duration-200"
            style={{ width: `${1024 * desktopScale}px` }}
          >
            {/* Browser Mockup Chrome Bar */}
            <div className="h-7 bg-slate-100 dark:bg-slate-900 border-b border-border px-3 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-mono text-muted border border-border/60">
                🔒 nexora.local/{activeSurface === "website" ? "home" : activeSurface}
              </div>
              <span className="text-[10px] font-mono font-bold text-muted uppercase">
                {theme.slug}
              </span>
            </div>
            {/* Fluid Scaled Desktop Canvas */}
            <div
              className="relative overflow-hidden bg-background"
              style={{
                width: `${1024 * desktopScale}px`,
                height: `${720 * desktopScale}px`,
              }}
            >
              <iframe
                ref={frameRef}
                title="Theme preview"
                sandbox=""
                className="border-none origin-top-left"
                style={{
                  width: "1024px",
                  height: "720px",
                  transform: `scale(${desktopScale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
        ) : isTablet ? (
          /* iPad Tablet Bezel */
          <div
            className="rounded-[1.8rem] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl bg-card overflow-hidden flex flex-col transition-all duration-200"
            style={{ width: `${768 * tabletScale + 16}px` }}
          >
            <div className="h-5 bg-slate-800 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
            <div
              className="relative overflow-hidden bg-background"
              style={{
                width: `${768 * tabletScale}px`,
                height: `${840 * tabletScale}px`,
              }}
            >
              <iframe
                ref={frameRef}
                title="Theme preview"
                sandbox=""
                className="border-none origin-top-left"
                style={{
                  width: "768px",
                  height: "840px",
                  transform: `scale(${tabletScale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
        ) : (
          /* iPhone Mobile Bezel */
          <div
            className="rounded-[2.4rem] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl bg-card overflow-hidden flex flex-col transition-all duration-200"
            style={{ width: `${375 * mobileScale + 16}px` }}
          >
            <div className="h-5 bg-slate-800 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <div className="w-16 h-3 rounded-full bg-black/60" />
            </div>
            <div
              className="relative overflow-hidden bg-background"
              style={{
                width: `${375 * mobileScale}px`,
                height: `${640 * mobileScale}px`,
              }}
            >
              <iframe
                ref={frameRef}
                title="Theme preview"
                sandbox=""
                className="border-none origin-top-left"
                style={{
                  width: "375px",
                  height: "640px",
                  transform: `scale(${mobileScale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Status Pill */}
      <div className="border-t border-border bg-surface px-3 py-2 flex items-center justify-between text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">{theme.name}</span>
          <span>({theme.slug})</span>
        </div>
        <span className="font-mono text-[10px] uppercase font-bold text-primary">
          {mode.toUpperCase()} MODE
        </span>
      </div>
    </div>
  );
};
