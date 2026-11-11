namespace Nexora.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> SaveAsync(string storageKey, Stream stream, string mimeType, CancellationToken ct = default);
    Task<Stream?> OpenReadAsync(string storageKey, CancellationToken ct = default);
    Task<bool> DeleteAsync(string storageKey, CancellationToken ct = default);
    string GetPublicUrl(string storageKey);
}

