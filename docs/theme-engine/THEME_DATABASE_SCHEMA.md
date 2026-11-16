# Theme Database Schema

Migration: `20261115204151_Add_Themes_And_ThemeSettings`.

## Themes

| Column | Type | Constraints / Notes |
|---|---|---|
| `Id` | uniqueidentifier | PK |
| `Name` | nvarchar(200) | Required |
| `Slug` | nvarchar(200) | Required, unique index |
| `Description` | nvarchar(1000) | Default empty |
| `ConfigJson` | nvarchar(max) | Required, `ISJSON` check |
| `DraftConfigJson` | nvarchar(max) | Nullable, `ISJSON` check when not null |
| `IsSystem` | bit | Seeded presets |
| `IsDefault` | bit | Active default preset |
| `IsDeleted` | bit | Soft delete |
| `CurrentVersion` | int | Starts at 1 |
| `CreatedBy` | uniqueidentifier | Audit |
| `UpdatedBy` | uniqueidentifier | Audit |
| `Version` | rowversion | Optimistic concurrency |
| `CreatedAtUtc` | datetime2 | Base entity |
| `UpdatedAtUtc` | datetime2 | Base entity |

Check constraints:

- `CK_Themes_ConfigJson_Json`
- `CK_Themes_DraftConfigJson_Json`

Indexes:

- Unique `IX_Themes_Slug`
- `IX_Themes_IsDeleted_IsDefault`

## ThemeVersions

| Column | Type | Constraints / Notes |
|---|---|---|
| `Id` | uniqueidentifier | PK |
| `ThemeId` | uniqueidentifier | FK → `Themes.Id`, cascade delete |
| `VersionNumber` | int | Required |
| `ConfigJson` | nvarchar(max) | Required, `ISJSON` check |
| `ChangedBy` | uniqueidentifier | Nullable |
| `ChangeDescription` | nvarchar(500) | Default empty |
| `CreatedAtUtc` | datetime2 | Base entity |
| `UpdatedAtUtc` | datetime2 | Base entity |

Indexes:

- Unique `IX_ThemeVersions_ThemeId_VersionNumber`
- `IX_ThemeVersions_ThemeId`

Check constraint:

- `CK_ThemeVersions_ConfigJson_Json`

## SiteSettings (theme columns)

| Column | Type | Default |
|---|---|---|
| `GlobalThemeEngineEnabled` | bit | `1` |
| `WebsiteThemeEnabled` | bit | `1` |
| `WebsiteThemeId` | nvarchar(200) | `cyber-emerald` |
| `AdminThemeEnabled` | bit | `1` |
| `AdminThemeId` | nvarchar(200) | `cyber-emerald` |
| `FallbackThemeId` | nvarchar(200) | `cyber-emerald` |

The `*ThemeId` columns store theme **slugs**, not GUIDs. The service maps ids to slugs when activating.

Legacy `ThemeTokensJson` remains in the table for backward compatibility but is no longer used by the runtime.

## Seeded Presets

Seeded idempotently by `ThemePresetSeed` during `StartupSeeder`:

| Slug | Name | System |
|---|---|---|
| `cyber-emerald` | Cyber Emerald & Deep Onyx | yes, default |
| `silicon-valley` | Silicon Valley Electric | yes |
| `midnight-violet` | Midnight Violet & Sunset Coral | yes |
| `monochrome-stealth` | Monochrome Stealth & Laser Cobalt | yes |
| `sapphire-ocean` | Sapphire Ocean & Cyber Cyan | yes |
| `champagne-gold` | Champagne Gold & Executive Obsidian | yes |

Each seeded theme receives an initial version (v1).

## Apply the Migration

```
dotnet ef database update --project backend/src/Nexora.Infrastructure --startup-project backend/src/Nexora.Api
```

Or use the API startup seeder, which applies migrations and seeds presets.
