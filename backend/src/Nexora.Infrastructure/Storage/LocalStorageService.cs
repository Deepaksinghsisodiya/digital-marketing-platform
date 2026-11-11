using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Nexora.Application.Common.Interfaces;

namespace Nexora.Infrastructure.Storage;

public class LocalStorageService : IStorageService
{
    private readonly string _storageRoot;
    private readonly string _baseUrl;

    public LocalStorageService(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredPath = configuration["Storage:LocalRootPath"];
        _storageRoot = !string.IsNullOrWhiteSpace(configuredPath)
            ? Path.GetFullPath(configuredPath)
            : Path.Combine(AppContext.BaseDirectory, "uploads");

        if (!Directory.Exists(_storageRoot))
        {
            Directory.CreateDirectory(_storageRoot);
        }

        _baseUrl = configuration["Storage:BaseUrl"] ?? "/api/v1/public/media";
    }

    private string GetPhysicalPath(string storageKey)
    {
        var cleanKey = storageKey.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_storageRoot, cleanKey));
        if (!fullPath.StartsWith(_storageRoot, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid storage key: path traversal detected.");
        }
        return fullPath;
    }

    public async Task<string> SaveAsync(string storageKey, Stream stream, string mimeType, CancellationToken ct = default)
    {
        var fullPath = GetPhysicalPath(storageKey);
        var dir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }

        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await stream.CopyToAsync(fileStream, ct);
        return storageKey;
    }

    public Task<Stream?> OpenReadAsync(string storageKey, CancellationToken ct = default)
    {
        var fullPath = GetPhysicalPath(storageKey);
        if (!File.Exists(fullPath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);
        return Task.FromResult<Stream?>(stream);
    }

    public Task<bool> DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        var fullPath = GetPhysicalPath(storageKey);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public string GetPublicUrl(string storageKey)
    {
        var cleanKey = storageKey.TrimStart('/');
        return $"{_baseUrl.TrimEnd('/')}/{cleanKey}";
    }
}

