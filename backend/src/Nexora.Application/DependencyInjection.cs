using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Nexora.Application.Common.Localization;

namespace Nexora.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services,
        IConfiguration? configuration = null)
    {
        var regionOptions = new RegionOptions();
        if (configuration != null)
        {
            configuration.GetSection(RegionOptions.SectionName).Bind(regionOptions);
        }
        services.AddSingleton(Options.Create(regionOptions));

        services.AddScoped<ICurrentRegionService, CurrentRegionService>();
        return services;
    }
}
