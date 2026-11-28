FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props global.json ./
COPY backend/Nexora.sln backend/
COPY backend/src/Nexora.Domain/Nexora.Domain.csproj backend/src/Nexora.Domain/
COPY backend/src/Nexora.Application/Nexora.Application.csproj backend/src/Nexora.Application/
COPY backend/src/Nexora.Infrastructure/Nexora.Infrastructure.csproj backend/src/Nexora.Infrastructure/
COPY backend/src/Nexora.Api/Nexora.Api.csproj backend/src/Nexora.Api/

RUN dotnet restore backend/src/Nexora.Api/Nexora.Api.csproj

COPY backend/src/ backend/src/
RUN dotnet publish backend/src/Nexora.Api/Nexora.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN mkdir -p /app/wwwroot/uploads /app/logs

COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8080/health/live || exit 1
ENTRYPOINT ["dotnet", "Nexora.Api.dll"]
