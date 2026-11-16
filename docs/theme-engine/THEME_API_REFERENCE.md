# Theme API Reference

Base paths:

- Admin: `/api/v1/admin/themes` — requires `themes.view` / `themes.manage`, CSRF for mutations, audit on mutations.
- Public: `/api/v1/public/theme` — anonymous, ETag enabled.

## Admin Endpoints

### List themes

```
GET /api/v1/admin/themes?includeDeleted=false
```

Returns `ThemeSummaryDto[]`:

```ts
{
  id: string; name: string; slug: string; description: string;
  isSystem: boolean; isDefault: boolean; isDeleted: boolean; hasDraft: boolean;
  currentVersion: number; createdAtUtc: string; updatedAtUtc: string | null;
}
```

### Get theme

```
GET /api/v1/admin/themes/{id}
```

Returns `ThemeDetailDto` (includes `configJson`, `draftConfigJson`, `versionToken`).

### Get settings

```
GET /api/v1/admin/themes/settings
```

Returns:

```ts
{
  globalEngineEnabled: boolean;
  websiteThemeEnabled: boolean; websiteThemeId: string;
  adminThemeEnabled: boolean; adminThemeId: string;
  fallbackThemeId: string;
  versionToken: string; updatedAtUtc: string | null;
}
```

### Update settings

```
PUT /api/v1/admin/themes/settings
```

```json
{
  "globalEngineEnabled": true,
  "websiteThemeEnabled": true,
  "websiteThemeId": "cyber-emerald",
  "adminThemeEnabled": true,
  "adminThemeId": "cyber-emerald",
  "fallbackThemeId": "cyber-emerald",
  "versionToken": "<base64 rowversion>"
}
```

All body fields except `versionToken` are optional. A stale token returns HTTP 409.

### Create theme

```
POST /api/v1/admin/themes
{ "name": "Acme", "slug": "acme", "description": "...", "configJson": "{...}" }
```

`slug` and `configJson` are optional. When omitted, the slug is derived from the name and the config is copied from the default theme. The server stamps `id`/`slug`/`name` into the config.

### Save draft

```
PUT /api/v1/admin/themes/{id}/draft
{ "configJson": "{...}", "baseVersionToken": "<base64 rowversion>" }
```

`baseVersionToken` is optional; when supplied, stale drafts are rejected.

### Publish

```
POST /api/v1/admin/themes/{id}/publish
{ "changeDescription": "Tuned contrast" }
```

Creates `ThemeVersion`, increments `CurrentVersion`, clears the draft.

### Duplicate

```
POST /api/v1/admin/themes/{id}/duplicate
```

### Delete

```
DELETE /api/v1/admin/themes/{id}
```

Rejected for system/default/active themes.

### Activate / assign

```
POST /api/v1/admin/themes/{id}/activate
{ "target": "website" | "admin" | "both" }
```

Maps theme id to slug and updates `SiteSettings`, then invalidates the public theme cache.

### Versions

```
GET /api/v1/admin/themes/{id}/versions
```

Returns `ThemeVersionDto[]` newest first.

### Rollback

```
POST /api/v1/admin/themes/{id}/rollback
{ "versionNumber": 3 }
```

### Import / export

```
POST /api/v1/admin/themes/import
{ "name": "...", "slug": "...", "description": "...", "configJson": "{...}" }

GET /api/v1/admin/themes/{id}/export
```

Export returns a downloadable JSON file.

## Public Endpoint

```
GET /api/v1/public/theme?app=website
GET /api/v1/public/theme?app=admin
```

Response:

```ts
{
  app: "website" | "admin";
  themeId: string;   // theme slug
  name: string;
  slug: string;
  schemaVersion: number;
  config: ThemeConfig;
  source: "assigned" | "fallback" | "default";
  isDefault: boolean;
}
```

Headers:

- `ETag`: SHA256 of the payload.
- `Cache-Control: public, max-age=30, stale-while-revalidate=120`.
- Send `If-None-Match` to receive `304 Not Modified`.

## Error Shape

Errors use the existing Nexora API convention (problem details / message payloads) and appropriate status codes:

- `400` validation failure
- `401` / `403` authentication / permission failure
- `404` unknown theme
- `409` concurrency conflict or duplicate slug
