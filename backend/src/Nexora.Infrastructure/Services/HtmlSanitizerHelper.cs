using Ganss.Xss;

namespace Nexora.Infrastructure.Services;

public static class HtmlSanitizerHelper
{
    private static readonly Lazy<HtmlSanitizer> Sanitizer = new(() =>
    {
        var sanitizer = new HtmlSanitizer();
        sanitizer.AllowedSchemes.Remove("javascript");
        sanitizer.AllowedSchemes.Remove("data");
        sanitizer.AllowedSchemes.Add("http");
        sanitizer.AllowedSchemes.Add("https");
        sanitizer.AllowedSchemes.Add("mailto");
        sanitizer.AllowedSchemes.Add("tel");
        return sanitizer;
    });

    public static string Sanitize(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        return Sanitizer.Value.Sanitize(html);
    }
}
