using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using Nexora.Application.Common.Interfaces;

namespace Nexora.Infrastructure.Storage;

/// <summary>
/// Cloud media storage adapter supporting S3-compatible / Azure Blob HTTP endpoints.
/// Activated when Storage:Provider = "Cloud" (or "S3" / "AzureBlob") and Storage:Cloud:EndpointUrl is configured.
/// </summary>
public class S3StorageService : IStorageService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _endpointUrl;
    private readonly string _publicBaseUrl;
    private readonly string? _bearerToken;
    private readonly string? _sasQuery;

    public S3StorageService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
        var section = configuration.GetSection("Storage:Cloud");
        var s3Section = configuration.GetSection("Storage:S3");

        _endpointUrl = section["EndpointUrl"]
            ?? s3Section["ServiceUrl"]
            ?? $"https://{s3Section["BucketName"]}.s3.{s3Section["Region"] ?? "ap-south-1"}.amazonaws.com";

        _publicBaseUrl = section["PublicBaseUrl"]
            ?? s3Section["PublicBaseUrl"]
            ?? _endpointUrl;

        _bearerToken = section["BearerToken"] ?? s3Section["AccessKey"];
        _sasQuery = section["SasToken"];
    }

    private string BuildObjectUrl(string storageKey)
    {
        var cleanKey = storageKey.TrimStart('/');
        var url = $"{_endpointUrl.TrimEnd('/')}/{cleanKey}";
        if (!string.IsNullOrWhiteSpace(_sasQuery))
        {
            var sep = url.Contains('?') ? "&" : "?";
            url = $"{url}{sep}{_sasQuery.TrimStart('?')}";
        }
        return url;
    }

    private HttpClient CreateClient()
    {
        var client = _httpClientFactory.CreateClient("CloudStorage");
        if (!string.IsNullOrWhiteSpace(_bearerToken))
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _bearerToken);
        }
        return client;
    }

    public async Task<string> SaveAsync(string storageKey, Stream stream, string mimeType, CancellationToken ct = default)
    {
        var cleanKey = storageKey.TrimStart('/');
        using var client = CreateClient();
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
        if (!string.IsNullOrWhiteSpace(_sasQuery))
        {
            content.Headers.TryAddWithoutValidation("x-ms-blob-type", "BlockBlob");
        }

        var response = await client.PutAsync(BuildObjectUrl(cleanKey), content, ct);
        response.EnsureSuccessStatusCode();
        return cleanKey;
    }

    public async Task<Stream?> OpenReadAsync(string storageKey, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var response = await client.GetAsync(BuildObjectUrl(storageKey), ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        response.EnsureSuccessStatusCode();
        var ms = new MemoryStream();
        await response.Content.CopyToAsync(ms, ct);
        ms.Position = 0;
        return ms;
    }

    public async Task<bool> DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var response = await client.DeleteAsync(BuildObjectUrl(storageKey), ct);
        return response.IsSuccessStatusCode;
    }

    public string GetPublicUrl(string storageKey)
    {
        var cleanKey = storageKey.TrimStart('/');
        return $"{_publicBaseUrl.TrimEnd('/')}/{cleanKey}";
    }
}
