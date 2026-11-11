BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111202444_Add_Lead_Scoring_And_Webhooks'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [WebhookSecret] nvarchar(128) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111202444_Add_Lead_Scoring_And_Webhooks'
)
BEGIN
    ALTER TABLE [SiteSettings] ADD [WebhookUrl] nvarchar(512) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111202444_Add_Lead_Scoring_And_Webhooks'
)
BEGIN
    ALTER TABLE [Leads] ADD [Score] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111202444_Add_Lead_Scoring_And_Webhooks'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261111202444_Add_Lead_Scoring_And_Webhooks', N'10.0.14');
END;

COMMIT;
GO

