using System.Text.Json;
using Nexora.Application.Themes;
using Nexora.Domain.Entities;
using Shouldly;
using Xunit;

namespace Nexora.UnitTests;

public class ThemeEngineTests
{
    private static readonly string ValidCyberEmeraldJson = """
    {
      "schemaVersion": 1,
      "id": "cyber-emerald",
      "slug": "cyber-emerald",
      "name": "Cyber Emerald & Deep Onyx",
      "tagline": "High-frequency engineering",
      "colors": {
        "light": {
          "primary": "#10b981",
          "primaryForeground": "#ffffff",
          "primaryHover": "#059669",
          "primaryActive": "#047857",
          "secondary": "#0f172a",
          "secondaryForeground": "#ffffff",
          "accent": "#06b6d4",
          "accentForeground": "#ffffff",
          "background": "#ffffff",
          "foreground": "#0f172a",
          "surface": "#f8fafc",
          "surfaceElevated": "#ffffff",
          "card": "#ffffff",
          "cardForeground": "#0f172a",
          "navbar": "rgba(255, 255, 255, 0.85)",
          "footer": "#080c14",
          "sidebar": "#ffffff",
          "modal": "#ffffff",
          "overlay": "rgba(15, 23, 42, 0.5)",
          "textPrimary": "#0f172a",
          "textSecondary": "#475569",
          "textMuted": "#64748b",
          "textInverted": "#ffffff",
          "link": "#10b981",
          "linkHover": "#059669",
          "border": "#e2e8f0",
          "borderStrong": "#cbd5e1",
          "divider": "#f1f5f9",
          "input": "#ffffff",
          "ring": "#10b981",
          "selection": "#10b981",
          "disabled": "#94a3b8",
          "placeholder": "#94a3b8",
          "success": "#10b981",
          "warning": "#f59e0b",
          "danger": "#ef4444",
          "info": "#06b6d4",
          "navy": "#080c14",
          "ink": "#0d1422"
        },
        "dark": {
          "primary": "#10b981",
          "primaryForeground": "#ffffff",
          "primaryHover": "#34d399",
          "primaryActive": "#059669",
          "secondary": "#1e293b",
          "secondaryForeground": "#ffffff",
          "accent": "#06b6d4",
          "accentForeground": "#ffffff",
          "background": "#080c14",
          "foreground": "#f8fafc",
          "surface": "#0d1422",
          "surfaceElevated": "#131b2e",
          "card": "#0d1422",
          "cardForeground": "#f8fafc",
          "navbar": "rgba(8, 12, 20, 0.85)",
          "footer": "#04060a",
          "sidebar": "#0d1422",
          "modal": "#0d1422",
          "overlay": "rgba(0, 0, 0, 0.75)",
          "textPrimary": "#f8fafc",
          "textSecondary": "#94a3b8",
          "textMuted": "#64748b",
          "textInverted": "#0f172a",
          "link": "#34d399",
          "linkHover": "#6ee7b7",
          "border": "rgba(255, 255, 255, 0.08)",
          "borderStrong": "rgba(255, 255, 255, 0.16)",
          "divider": "rgba(255, 255, 255, 0.05)",
          "input": "#131b2e",
          "ring": "#10b981",
          "selection": "#10b981",
          "disabled": "#475569",
          "placeholder": "#64748b",
          "success": "#10b981",
          "warning": "#f59e0b",
          "danger": "#ef4444",
          "info": "#06b6d4",
          "navy": "#080c14",
          "ink": "#0d1422"
        }
      },
      "typography": {
        "fontSans": "Inter, ui-sans-serif, system-ui, sans-serif",
        "fontHeading": "Plus Jakarta Sans, Inter, sans-serif",
        "fontButton": "Inter, sans-serif",
        "fontNav": "Inter, sans-serif",
        "fontMono": "ui-monospace, monospace",
        "baseFontSize": "16px",
        "headingWeight": "700",
        "letterSpacingHeading": "-0.025em"
      },
      "shape": {
        "radiusSm": "0.375rem",
        "radiusMd": "0.5rem",
        "radiusLg": "0.75rem",
        "radiusXl": "1rem",
        "radiusFull": "9999px",
        "buttonRadius": "0.5rem",
        "cardRadius": "0.75rem",
        "inputRadius": "0.5rem"
      },
      "shadows": {
        "shadowSm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "shadowMd": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "shadowLg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "glow": "rgba(16, 185, 129, 0.28)",
        "glassBlur": "16px"
      },
      "gradients": {
        "gradientBrand": "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
        "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16, 185, 129, 0.18), transparent 70%)",
        "gradientAccent": "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
      },
      "layout": {
        "containerWidth": "1280px",
        "sectionSpacing": "5rem",
        "navbarHeight": "4.5rem",
        "sidebarWidth": "16rem"
      },
      "motion": {
        "enabled": true,
        "speed": "normal",
        "durationFast": "0.15s",
        "durationNormal": "0.3s",
        "durationSlow": "0.6s"
      },
      "components": {
        "buttonStyle": "rounded",
        "cardStyle": "glass",
        "tableDensity": "normal"
      },
      "admin": {
        "sidebarBg": "#0d1422",
        "sidebarBorder": "rgba(255, 255, 255, 0.08)",
        "sidebarActiveItem": "rgba(16, 185, 129, 0.15)",
        "navbarBg": "rgba(13, 20, 34, 0.8)",
        "navbarBorder": "rgba(255, 255, 255, 0.08)",
        "widgetCardBg": "#0d1422"
      }
    }
    """;

    [Fact]
    public void ThemeConfigValidator_ValidPreset_PassesValidation()
    {
        var (isValid, errors) = ThemeConfigValidator.Validate(ValidCyberEmeraldJson);

        isValid.ShouldBeTrue($"Validation should pass. Errors: {string.Join(", ", errors)}");
        errors.ShouldBeEmpty();
    }

    [Fact]
    public void ThemeConfigValidator_NullOrEmptyJson_FailsValidation()
    {
        var (isValid, errors) = ThemeConfigValidator.Validate(null);

        isValid.ShouldBeFalse();
        errors.ShouldNotBeEmpty();
    }

    [Fact]
    public void ThemeConfigValidator_InvalidColor_FailsValidation()
    {
        var invalidJson = ValidCyberEmeraldJson.Replace("#10b981", "not-a-color-at-all");

        var (isValid, errors) = ThemeConfigValidator.Validate(invalidJson);

        isValid.ShouldBeFalse();
        errors.ShouldContain(e => e.Contains("must be a valid hex, rgb or hsl color"));
    }

    [Fact]
    public void ThemeConfigValidator_UnsafeContent_FailsValidation()
    {
        var maliciousJson = ValidCyberEmeraldJson.Replace("#10b981", "javascript:alert(1)");

        var (isValid, errors) = ThemeConfigValidator.Validate(maliciousJson);

        isValid.ShouldBeFalse();
        errors.ShouldContain(e => e.Contains("unsafe content"));
    }

    [Fact]
    public void Theme_Entity_Initialization_HasCorrectDefaults()
    {
        var theme = new Theme
        {
            Name = "Custom Aurora",
            Slug = "custom-aurora",
            Description = "Custom theme for testing",
            ConfigJson = ValidCyberEmeraldJson,
            IsSystem = false,
            IsDefault = false
        };

        theme.Id.ShouldNotBe(Guid.Empty);
        theme.IsDeleted.ShouldBeFalse();
        theme.IsSystem.ShouldBeFalse();
        theme.CurrentVersion.ShouldBe(1);
        theme.Versions.ShouldBeEmpty();
    }

    [Fact]
    public void ThemeVersion_Entity_Initialization_HasCorrectValues()
    {
        var themeId = Guid.NewGuid();
        var version = new ThemeVersion
        {
            ThemeId = themeId,
            VersionNumber = 1,
            ConfigJson = ValidCyberEmeraldJson,
            ChangeDescription = "Initial Version"
        };

        version.Id.ShouldNotBe(Guid.Empty);
        version.ThemeId.ShouldBe(themeId);
        version.VersionNumber.ShouldBe(1);
        version.ChangeDescription.ShouldBe("Initial Version");
    }

    [Fact]
    public void SiteSettings_ThemeEngine_Toggles_DefaultValues()
    {
        var settings = new SiteSettings();

        settings.GlobalThemeEngineEnabled.ShouldBeTrue();
        settings.WebsiteThemeEnabled.ShouldBeTrue();
        settings.AdminThemeEnabled.ShouldBeTrue();
        settings.WebsiteThemeId.ShouldBe("cyber-emerald");
        settings.AdminThemeId.ShouldBe("cyber-emerald");
        settings.FallbackThemeId.ShouldBe("cyber-emerald");
    }
}
