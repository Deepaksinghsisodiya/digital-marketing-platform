using NetArchTest.Rules;
using Shouldly;
using Xunit;

namespace Nexora.ArchitectureTests;

public class CleanArchitectureTests
{
    private const string DomainNamespace = "Nexora.Domain";
    private const string ApplicationNamespace = "Nexora.Application";
    private const string InfrastructureNamespace = "Nexora.Infrastructure";
    private const string ApiNamespace = "Nexora.Api";

    [Fact]
    public void Domain_Should_Not_HaveDependencyOn_OtherProjects()
    {
        var domainAssembly = typeof(Nexora.Domain.Common.IAggregateRoot).Assembly;

        var result = Types.InAssembly(domainAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(ApplicationNamespace, InfrastructureNamespace, ApiNamespace)
            .GetResult();

        result.IsSuccessful.ShouldBeTrue("Domain must not depend on Application, Infrastructure, or Api layers.");
    }

    [Fact]
    public void Application_Should_Not_HaveDependencyOn_InfrastructureOrApi()
    {
        var applicationAssembly = typeof(Nexora.Application.DependencyInjection).Assembly;

        var result = Types.InAssembly(applicationAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(InfrastructureNamespace, ApiNamespace)
            .GetResult();

        result.IsSuccessful.ShouldBeTrue("Application must not depend on Infrastructure or Api layers.");
    }

    [Fact]
    public void Infrastructure_Should_Not_HaveDependencyOn_Api()
    {
        var infrastructureAssembly = typeof(Nexora.Infrastructure.DependencyInjection).Assembly;

        var result = Types.InAssembly(infrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(ApiNamespace)
            .GetResult();

        result.IsSuccessful.ShouldBeTrue("Infrastructure must not depend on Api layer.");
    }
}
