using System.Text.Json;
using System.Text.RegularExpressions;

namespace Nexora.Application.Themes;

/// <summary>
/// Strict, defensive validation for untrusted theme JSON payloads.
/// Only whitelisted token shapes and value formats are accepted; raw CSS/JS is rejected.
/// </summary>
public static partial class ThemeConfigValidator
{
    public const int MaxPayloadBytes = 256 * 1024;

    private static readonly string[] BrandColorKeys =
    [
        "primary", "primaryForeground", "primaryHover", "primaryActive",
        "secondary", "secondaryForeground", "accent", "accentForeground"
    ];

    private static readonly string[] SurfaceColorKeys =
    [
        "background", "foreground", "surface", "surfaceElevated", "card", "cardForeground",
        "navbar", "footer", "sidebar", "modal", "overlay"
    ];

    private static readonly string[] TextColorKeys =
    [
        "textPrimary", "textSecondary", "textMuted", "textInverted", "link", "linkHover"
    ];

    private static readonly string[] UiColorKeys =
    [
        "border", "borderStrong", "divider", "input", "ring", "selection", "disabled", "placeholder"
    ];

    private static readonly string[] StatusColorKeys = ["success", "warning", "danger", "info"];
    private static readonly string[] CanvasColorKeys = ["navy", "ink"];
    private static readonly string[] AdminColorKeys =
    [
        "sidebarBg", "sidebarBorder", "sidebarActiveItem", "navbarBg", "navbarBorder", "widgetCardBg"
    ];

    private static readonly string[] ColorKeys = BrandColorKeys
        .Concat(SurfaceColorKeys)
        .Concat(TextColorKeys)
        .Concat(UiColorKeys)
        .Concat(StatusColorKeys)
        .Concat(CanvasColorKeys)
        .ToArray();

    [GeneratedRegex(@"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")]
    private static partial Regex HexColorRegex();

    [GeneratedRegex(@"^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/]+\)$", RegexOptions.IgnoreCase)]
    private static partial Regex FunctionalColorRegex();

    [GeneratedRegex(@"^(?:linear-gradient|radial-gradient|conic-gradient)\([0-9a-zA-Z#.,()%\s+-]+\)$")]
    private static partial Regex GradientRegex();

    [GeneratedRegex(@"^(?:-?[0-9.]+(?:px|rem|em|%|vh|vw|ch)|calc\([0-9a-zA-Z.()%\s+*\/-]+\)|0)$")]
    private static partial Regex DimensionRegex();

    [GeneratedRegex(@"javascript:|expression\s*\(|url\s*\(|[<>{}]")]
    private static partial Regex UnsafeContentRegex();

    public static (bool IsValid, List<string> Errors) Validate(string? json)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(json))
        {
            return (false, ["Theme configuration JSON is required."]);
        }

        if (System.Text.Encoding.UTF8.GetByteCount(json) > MaxPayloadBytes)
        {
            return (false, ["Theme configuration exceeds the maximum allowed size (256 KB)."]);
        }

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(json, new JsonDocumentOptions
            {
                AllowTrailingCommas = false,
                CommentHandling = JsonCommentHandling.Disallow
            });
        }
        catch (JsonException)
        {
            return (false, ["Theme configuration is not valid JSON."]);
        }

        using (doc)
        {
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
            {
                return (false, ["Theme configuration must be a JSON object."]);
            }

            if (root.TryGetProperty("schemaVersion", out var schemaVersion))
            {
                if (schemaVersion.ValueKind != JsonValueKind.Number ||
                    !schemaVersion.TryGetInt32(out var sv) || sv < 1 || sv > 100)
                {
                    errors.Add("schemaVersion must be a positive integer.");
                }
            }

            if (root.TryGetProperty("name", out var name) && !IsSafeText(name, 120))
            {
                errors.Add("name contains unsafe or oversized content.");
            }

            if (root.TryGetProperty("slug", out var slug))
            {
                if (slug.ValueKind != JsonValueKind.String ||
                    !SlugRegex().IsMatch(slug.GetString() ?? string.Empty))
                {
                    errors.Add("slug must contain only lowercase alphanumeric characters and hyphens.");
                }
            }

            if (root.TryGetProperty("colors", out var colors))
            {
                ValidateColorPalette(colors, "light", ColorKeys, errors);
                ValidateColorPalette(colors, "dark", ColorKeys, errors);
            }

            if (root.TryGetProperty("admin", out var admin) && admin.ValueKind == JsonValueKind.Object)
            {
                foreach (var key in AdminColorKeys)
                {
                    if (admin.TryGetProperty(key, out var value) && !IsSafeColor(value))
                    {
                        errors.Add($"admin.{key} must be a valid color value.");
                    }
                }
            }

            if (root.TryGetProperty("typography", out var typography))
            {
                ValidateTypography(typography, errors);
            }

            if (root.TryGetProperty("gradients", out var gradients))
            {
                ValidateGradients(gradients, errors);
            }

            if (root.TryGetProperty("shadows", out var shadows))
            {
                ValidateShadowValues(shadows, errors);
            }

            if (root.TryGetProperty("shape", out var shape))
            {
                ValidateDimensions(shape, "shape", errors);
            }

            if (root.TryGetProperty("layout", out var layout))
            {
                ValidateDimensions(layout, "layout", errors);
            }

            if (root.TryGetProperty("motion", out var motion))
            {
                ValidateMotion(motion, errors);
            }

            if (root.TryGetProperty("components", out var components))
            {
                ValidateComponents(components, errors);
            }
        }

        return (errors.Count == 0, errors);
    }

    private static void ValidateColorPalette(JsonElement colors, string mode, string[] keys, List<string> errors)
    {
        if (!colors.TryGetProperty(mode, out var palette))
        {
            return;
        }

        if (palette.ValueKind != JsonValueKind.Object)
        {
            errors.Add($"colors.{mode} must be an object.");
            return;
        }

        foreach (var key in keys)
        {
            if (palette.TryGetProperty(key, out var value) && !IsSafeColor(value))
            {
                errors.Add($"colors.{mode}.{key} must be a valid hex, rgb or hsl color.");
            }
        }
    }

    private static void ValidateTypography(JsonElement typography, List<string> errors)
    {
        if (typography.ValueKind != JsonValueKind.Object)
        {
            errors.Add("typography must be an object.");
            return;
        }

        foreach (var key in new[] { "fontSans", "fontHeading", "fontButton", "fontNav", "fontMono" })
        {
            if (typography.TryGetProperty(key, out var value) && !IsSafeText(value, 300))
            {
                errors.Add($"typography.{key} contains unsafe or oversized content.");
            }
        }

        if (typography.TryGetProperty("headingWeight", out var weight))
        {
            if (weight.ValueKind == JsonValueKind.String)
            {
                var raw = weight.GetString() ?? string.Empty;
                if (!int.TryParse(raw, out var w) || w < 100 || w > 900)
                {
                    errors.Add("typography.headingWeight must be a weight between 100 and 900.");
                }
            }
            else if (weight.ValueKind != JsonValueKind.Number)
            {
                errors.Add("typography.headingWeight must be numeric.");
            }
        }
    }

    private static void ValidateGradients(JsonElement gradients, List<string> errors)
    {
        if (gradients.ValueKind != JsonValueKind.Object)
        {
            errors.Add("gradients must be an object.");
            return;
        }

        foreach (var property in gradients.EnumerateObject())
        {
            if (property.Value.ValueKind != JsonValueKind.String)
            {
                errors.Add($"gradients.{property.Name} must be a string.");
                continue;
            }

            var raw = property.Value.GetString()?.Trim() ?? string.Empty;
            if (UnsafeContentRegex().IsMatch(raw))
            {
                errors.Add($"gradients.{property.Name} contains unsafe content.");
                continue;
            }

            if (!GradientRegex().IsMatch(raw) && !IsSafeColor(property.Value))
            {
                errors.Add($"gradients.{property.Name} must be a safe CSS gradient or color.");
            }
        }
    }

    private static void ValidateShadowValues(JsonElement shadows, List<string> errors)
    {
        if (shadows.ValueKind != JsonValueKind.Object)
        {
            errors.Add("shadows must be an object.");
            return;
        }

        foreach (var property in shadows.EnumerateObject())
        {
            if (property.Value.ValueKind != JsonValueKind.String)
            {
                errors.Add($"shadows.{property.Name} must be a string.");
                continue;
            }

            var raw = property.Value.GetString() ?? string.Empty;
            if (raw.Length > 160 || UnsafeContentRegex().IsMatch(raw))
            {
                errors.Add($"shadows.{property.Name} contains unsafe content.");
            }
        }
    }

    private static void ValidateDimensions(JsonElement element, string section, List<string> errors)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            errors.Add($"{section} must be an object.");
            return;
        }

        foreach (var property in element.EnumerateObject())
        {
            if (property.Value.ValueKind != JsonValueKind.String)
            {
                errors.Add($"{section}.{property.Name} must be a string.");
                continue;
            }

            var raw = property.Value.GetString()?.Trim() ?? string.Empty;
            if (UnsafeContentRegex().IsMatch(raw) || !DimensionRegex().IsMatch(raw))
            {
                errors.Add($"{section}.{property.Name} has an invalid dimension value: {raw}");
            }
        }
    }

    private static void ValidateMotion(JsonElement motion, List<string> errors)
    {
        if (motion.ValueKind != JsonValueKind.Object)
        {
            errors.Add("motion must be an object.");
            return;
        }

        if (motion.TryGetProperty("enabled", out var enabled) &&
            enabled.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
        {
            errors.Add("motion.enabled must be a boolean.");
        }

        if (motion.TryGetProperty("speed", out var speed))
        {
            var value = speed.ValueKind == JsonValueKind.String ? speed.GetString() : null;
            if (value is not ("fast" or "normal" or "slow"))
            {
                errors.Add("motion.speed must be one of: fast, normal, slow.");
            }
        }
    }

    private static void ValidateComponents(JsonElement components, List<string> errors)
    {
        if (components.ValueKind != JsonValueKind.Object)
        {
            errors.Add("components must be an object.");
            return;
        }

        if (components.TryGetProperty("buttonStyle", out var buttonStyle))
        {
            var value = buttonStyle.ValueKind == JsonValueKind.String ? buttonStyle.GetString() : null;
            if (value is not ("rounded" or "sharp" or "pill"))
            {
                errors.Add("components.buttonStyle must be one of: rounded, sharp, pill.");
            }
        }

        if (components.TryGetProperty("cardStyle", out var cardStyle))
        {
            var value = cardStyle.ValueKind == JsonValueKind.String ? cardStyle.GetString() : null;
            if (value is not ("flat" or "elevated" or "glass" or "outlined" or "gradient"))
            {
                errors.Add("components.cardStyle must be one of: flat, elevated, glass, outlined, gradient.");
            }
        }

        if (components.TryGetProperty("tableDensity", out var density))
        {
            var value = density.ValueKind == JsonValueKind.String ? density.GetString() : null;
            if (value is not ("compact" or "normal" or "spacious"))
            {
                errors.Add("components.tableDensity must be one of: compact, normal, spacious.");
            }
        }
    }

    private static bool IsSafeColor(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var raw = element.GetString()?.Trim() ?? string.Empty;
        if (raw.Length == 0 || raw.Length > 50)
        {
            return false;
        }

        if (UnsafeContentRegex().IsMatch(raw))
        {
            return false;
        }

        return HexColorRegex().IsMatch(raw) || FunctionalColorRegex().IsMatch(raw);
    }

    private static bool IsSafeText(JsonElement element, int maxLength)
    {
        if (element.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var raw = element.GetString() ?? string.Empty;
        if (raw.Length > maxLength)
        {
            return false;
        }

        return !UnsafeContentRegex().IsMatch(raw);
    }

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    private static partial Regex SlugRegex();
}
