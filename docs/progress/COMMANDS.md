# Commands Executed Log

```powershell
# Website Typecheck & Tests
pnpm --filter @nexora/website exec tsc --noEmit
pnpm --filter @nexora/website test

# Admin Typecheck, Tests & Production Build
pnpm --filter @nexora/admin exec tsc --noEmit
pnpm --filter @nexora/admin test
pnpm --filter @nexora/admin build

# Backend Integration Tests (Release config avoids bin/Debug lock while API runs)
dotnet test backend/tests/Nexora.IntegrationTests/Nexora.IntegrationTests.csproj -c Release --verbosity minimal
```
