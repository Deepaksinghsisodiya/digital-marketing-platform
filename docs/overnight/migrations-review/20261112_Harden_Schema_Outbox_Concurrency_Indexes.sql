BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    DROP INDEX [IX_PipelineStages_Category_Value] ON [PipelineStages];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [TaskItems] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[SiteSettings]') AND [c].[name] = N'SectionVisibilityJson');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [SiteSettings] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [SiteSettings] ADD DEFAULT N'{}' FOR [SectionVisibilityJson];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [PreviewTokens] ADD [TokenHash] nvarchar(64) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [OutboxMessages] ADD [DeadLetterReason] nvarchar(500) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [OutboxMessages] ADD [NextAttemptAtUtc] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [OutboxMessages] ADD [Status] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [Leads] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [FormDefinitions] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [EmailTemplates] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [Clients] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    ALTER TABLE [BlogPosts] ADD [Version] rowversion NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    EXEC(N'ALTER TABLE [SiteSettings] ADD CONSTRAINT [CK_SiteSettings_SectionVisibility_Json] CHECK (ISJSON([SectionVisibilityJson]) = 1)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    CREATE INDEX [IX_PreviewTokens_TokenHash] ON [PreviewTokens] ([TokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PipelineStages_Category_StageKey] ON [PipelineStages] ([Category], [StageKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PipelineStages_Category_Value] ON [PipelineStages] ([Category], [Value]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    CREATE INDEX [IX_OutboxMessages_Status_NextAttemptAtUtc] ON [OutboxMessages] ([Status], [NextAttemptAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_NavigationMenus_Key] ON [NavigationMenus] ([Key]) WHERE [RegionCode] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261111183804_Harden_Schema_Outbox_Concurrency_Indexes', N'10.0.14');
END;

COMMIT;
GO

