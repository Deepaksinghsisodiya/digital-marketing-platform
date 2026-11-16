namespace Nexora.Infrastructure.Themes;

/// <summary>
/// System preset seed data. Configurations are intentionally "partial" overrides of the
/// Cyber Emerald baseline; the shared @nexora/design-tokens resolver expands them into a
/// complete ThemeConfig at render time so missing keys can never break the UI.
/// </summary>
public static class ThemePresetSeed
{
    public sealed record PresetSeed(string Slug, string Name, string Description, string ConfigJson);

    public static IReadOnlyList<PresetSeed> GetPresets() =>
    [
        new(
            Slug: "cyber-emerald",
            Name: "Cyber Emerald & Deep Onyx",
            Description: "Default Nexora look. High-frequency engineering, Supabase & Cursor tech style.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "cyber-emerald",
              "slug": "cyber-emerald",
              "name": "Cyber Emerald & Deep Onyx",
              "tagline": "High-frequency engineering, Supabase & Cursor tech style",
              "badge": "Supabase / Cursor"
            }
            """),

        new(
            Slug: "silicon-valley",
            Name: "Silicon Valley Electric",
            Description: "Modern high-performance, Linear & Stripe corporate style.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "silicon-valley",
              "slug": "silicon-valley",
              "name": "Silicon Valley Electric",
              "tagline": "Modern high-performance, Linear & Stripe corporate style",
              "badge": "Linear / Stripe",
              "colors": {
                "light": {
                  "primary": "#4f46e5", "primaryHover": "#4338ca", "primaryActive": "#3730a3",
                  "accent": "#2563eb", "ring": "#4f46e5", "selection": "#4f46e5",
                  "link": "#4f46e5", "linkHover": "#4338ca", "navy": "#060b18", "ink": "#0a1124"
                },
                "dark": {
                  "primary": "#6366f1", "primaryHover": "#818cf8", "primaryActive": "#4f46e5",
                  "accent": "#3b82f6", "background": "#060b18", "surface": "#0a1124",
                  "surfaceElevated": "#101b38", "card": "#0a1124", "navbar": "rgba(6, 11, 24, 0.85)",
                  "sidebar": "#0a1124", "ring": "#6366f1", "selection": "#6366f1",
                  "link": "#818cf8", "linkHover": "#a5b4fc", "navy": "#060b18", "ink": "#0a1124"
                }
              },
              "shadows": { "glow": "rgba(79, 70, 229, 0.28)" },
              "gradients": {
                "gradientBrand": "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
                "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79, 70, 229, 0.18), transparent 70%)",
                "gradientAccent": "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)"
              }
            }
            """),

        new(
            Slug: "midnight-violet",
            Name: "Midnight Violet & Sunset Coral",
            Description: "Creative AI powerhouse, OpenAI & Raycast modern aurora.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "midnight-violet",
              "slug": "midnight-violet",
              "name": "Midnight Violet & Sunset Coral",
              "tagline": "Creative AI powerhouse, OpenAI & Raycast modern aurora",
              "badge": "OpenAI / Raycast",
              "colors": {
                "light": {
                  "primary": "#8b5cf6", "primaryHover": "#7c3aed", "primaryActive": "#6d28d9",
                  "accent": "#f97316", "ring": "#8b5cf6", "selection": "#8b5cf6",
                  "link": "#8b5cf6", "linkHover": "#7c3aed", "navy": "#0b0816", "ink": "#130f24"
                },
                "dark": {
                  "primary": "#a78bfa", "primaryHover": "#c4b5fd", "primaryActive": "#8b5cf6",
                  "accent": "#fb923c", "background": "#0b0816", "surface": "#130f24",
                  "surfaceElevated": "#1b1633", "card": "#130f24", "navbar": "rgba(11, 8, 22, 0.85)",
                  "sidebar": "#130f24", "ring": "#a78bfa", "selection": "#a78bfa",
                  "link": "#c4b5fd", "linkHover": "#ddd6fe", "navy": "#0b0816", "ink": "#130f24"
                }
              },
              "shadows": { "glow": "rgba(139, 92, 246, 0.28)" },
              "gradients": {
                "gradientBrand": "linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #f97316 100%)",
                "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139, 92, 246, 0.18), transparent 70%)",
                "gradientAccent": "linear-gradient(135deg, #8b5cf6 0%, #f97316 100%)"
              }
            }
            """),

        new(
            Slug: "monochrome-stealth",
            Name: "Monochrome Stealth & Laser Cobalt",
            Description: "Sub-second minimal speed, Apple Pro & Vercel precision.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "monochrome-stealth",
              "slug": "monochrome-stealth",
              "name": "Monochrome Stealth & Laser Cobalt",
              "tagline": "Sub-second minimal speed, Apple Pro & Vercel precision",
              "badge": "Apple Pro / Vercel",
              "colors": {
                "light": {
                  "primary": "#0055ff", "primaryHover": "#0043cc", "primaryActive": "#003299",
                  "accent": "#38bdf8", "ring": "#0055ff", "selection": "#0055ff",
                  "link": "#0055ff", "linkHover": "#0043cc", "navy": "#000000", "ink": "#0a0a0a"
                },
                "dark": {
                  "primary": "#3b82f6", "primaryHover": "#60a5fa", "primaryActive": "#2563eb",
                  "accent": "#38bdf8", "background": "#000000", "surface": "#0a0a0a",
                  "surfaceElevated": "#141414", "card": "#0a0a0a", "navbar": "rgba(0, 0, 0, 0.85)",
                  "sidebar": "#0a0a0a", "ring": "#3b82f6", "selection": "#3b82f6",
                  "link": "#60a5fa", "linkHover": "#93c5fd", "navy": "#000000", "ink": "#0a0a0a"
                }
              },
              "shadows": { "glow": "rgba(0, 85, 255, 0.28)" },
              "gradients": {
                "gradientBrand": "linear-gradient(135deg, #0055ff 0%, #2563eb 50%, #38bdf8 100%)",
                "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 85, 255, 0.18), transparent 70%)",
                "gradientAccent": "linear-gradient(135deg, #0055ff 0%, #38bdf8 100%)"
              }
            }
            """),

        new(
            Slug: "sapphire-ocean",
            Name: "Sapphire Ocean & Cyber Cyan",
            Description: "Global cloud infrastructure, Cloudflare & Docker enterprise.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "sapphire-ocean",
              "slug": "sapphire-ocean",
              "name": "Sapphire Ocean & Cyber Cyan",
              "tagline": "Global cloud infrastructure, Cloudflare & Docker enterprise",
              "badge": "Cloudflare / Docker",
              "colors": {
                "light": {
                  "primary": "#1d4ed8", "primaryHover": "#1e40af", "primaryActive": "#1e3a8a",
                  "accent": "#00d8ff", "ring": "#1d4ed8", "selection": "#1d4ed8",
                  "link": "#1d4ed8", "linkHover": "#1e40af", "navy": "#040d21", "ink": "#081636"
                },
                "dark": {
                  "primary": "#38bdf8", "primaryHover": "#7dd3fc", "primaryActive": "#0284c7",
                  "accent": "#00d8ff", "background": "#040d21", "surface": "#081636",
                  "surfaceElevated": "#0c204d", "card": "#081636", "navbar": "rgba(4, 13, 33, 0.85)",
                  "sidebar": "#081636", "ring": "#38bdf8", "selection": "#38bdf8",
                  "link": "#7dd3fc", "linkHover": "#bae6fd", "navy": "#040d21", "ink": "#081636"
                }
              },
              "shadows": { "glow": "rgba(0, 216, 255, 0.28)" },
              "gradients": {
                "gradientBrand": "linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #00d8ff 100%)",
                "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 216, 255, 0.18), transparent 70%)",
                "gradientAccent": "linear-gradient(135deg, #1d4ed8 0%, #00d8ff 100%)"
              }
            }
            """),

        new(
            Slug: "champagne-gold",
            Name: "Champagne Gold & Executive Obsidian",
            Description: "High-ticket bespoke advisory, Palantir & Luxury Private Equity.",
            ConfigJson: """
            {
              "schemaVersion": 1,
              "id": "champagne-gold",
              "slug": "champagne-gold",
              "name": "Champagne Gold & Executive Obsidian",
              "tagline": "High-ticket bespoke advisory, Palantir & Luxury Private Equity",
              "badge": "Luxury Elite",
              "colors": {
                "light": {
                  "primary": "#f59e0b", "primaryHover": "#d97706", "primaryActive": "#b45309",
                  "accent": "#d97706", "ring": "#f59e0b", "selection": "#f59e0b",
                  "link": "#b45309", "linkHover": "#92400e", "navy": "#0b0c10", "ink": "#14161d"
                },
                "dark": {
                  "primary": "#fbbf24", "primaryHover": "#fcd34d", "primaryActive": "#f59e0b",
                  "accent": "#f59e0b", "background": "#0b0c10", "surface": "#14161d",
                  "surfaceElevated": "#1c202a", "card": "#14161d", "navbar": "rgba(11, 12, 16, 0.85)",
                  "sidebar": "#14161d", "ring": "#fbbf24", "selection": "#fbbf24",
                  "link": "#fcd34d", "linkHover": "#fef08a", "navy": "#0b0c10", "ink": "#14161d"
                }
              },
              "shadows": { "glow": "rgba(245, 158, 11, 0.28)" },
              "gradients": {
                "gradientBrand": "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fde68a 100%)",
                "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245, 158, 11, 0.18), transparent 70%)",
                "gradientAccent": "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"
              }
            }
            """)
    ];
}
