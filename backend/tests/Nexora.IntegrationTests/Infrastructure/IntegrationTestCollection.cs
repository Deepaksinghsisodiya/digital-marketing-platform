using Xunit;

namespace Nexora.IntegrationTests.Infrastructure;

[CollectionDefinition("IntegrationTests", DisableParallelization = true)]
public class IntegrationTestCollection : ICollectionFixture<NexoraTestWebApplicationFactory>
{
}

