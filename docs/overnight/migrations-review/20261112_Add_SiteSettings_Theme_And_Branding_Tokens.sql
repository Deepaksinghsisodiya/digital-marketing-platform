BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [AnnouncementBarJson] nvarchar(max) NOT NULL DEFAULT N'{}';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [BookingUrl] nvarchar(500) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [FaviconMediaId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [SocialLinksJson] nvarchar(max) NOT NULL DEFAULT N'{}';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [ThemeTokensJson] nvarchar(max) NOT NULL DEFAULT N'{}';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [TrackingCodesJson] nvarchar(max) NOT NULL DEFAULT N'{}';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    EXEC(N'ALTER TABLE [SiteSettings] ADD CONSTRAINT [CK_SiteSettings_AnnouncementBar_Json] CHECK (ISJSON([AnnouncementBarJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    EXEC(N'ALTER TABLE [SiteSettings] ADD CONSTRAINT [CK_SiteSettings_SocialLinks_Json] CHECK (ISJSON([SocialLinksJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    EXEC(N'ALTER TABLE [SiteSettings] ADD CONSTRAINT [CK_SiteSettings_ThemeTokens_Json] CHECK (ISJSON([ThemeTokensJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    EXEC(N'ALTER TABLE [SiteSettings] ADD CONSTRAINT [CK_SiteSettings_TrackingCodes_Json] CHECK (ISJSON([TrackingCodesJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261111190100_Add_SiteSettings_Theme_And_Branding_Tokens', N'10.0.14');
END;

COMMIT;
GO

