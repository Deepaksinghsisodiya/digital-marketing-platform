using System.Text.RegularExpressions;

namespace Nexora.Infrastructure.Services;

public static partial class HtmlSanitizerHelper
{
    private static readonly Regex ScriptTagsRegex = new(@"<\s*script[^>]*>[\s\S]*?<\s*/\s*script\s*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex IframeTagsRegex = new(@"<\s*iframe[^>]*>[\s\S]*?<\s*/\s*iframe\s*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex ObjectTagsRegex = new(@"<\s*object[^>]*>[\s\S]*?<\s*/\s*object\s*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex EmbedTagsRegex = new(@"<\s*embed[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex AppletTagsRegex = new(@"<\s*applet[^>]*>[\s\S]*?<\s*/\s*applet\s*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex EventHandlersRegex = new(@"\s+on\w+\s*=\s*(""[^""]*""|'[^']*'|[^\s>]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex JavascriptHrefRegex = new(@"(href|src)\s*=\s*[""']?\s*javascript:[^""'>\s]+[""']?", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex DataHtmlRegex = new(@"(href|src)\s*=\s*[""']?\s*data:text/html[^""'>\s]+[""']?", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static string Sanitize(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        var cleaned = html;
        cleaned = ScriptTagsRegex.Replace(cleaned, string.Empty);
        cleaned = IframeTagsRegex.Replace(cleaned, string.Empty);
        cleaned = ObjectTagsRegex.Replace(cleaned, string.Empty);
        cleaned = EmbedTagsRegex.Replace(cleaned, string.Empty);
        cleaned = AppletTagsRegex.Replace(cleaned, string.Empty);
        cleaned = EventHandlersRegex.Replace(cleaned, string.Empty);
        cleaned = JavascriptHrefRegex.Replace(cleaned, string.Empty);
        cleaned = DataHtmlRegex.Replace(cleaned, string.Empty);

        return cleaned;
    }
}
