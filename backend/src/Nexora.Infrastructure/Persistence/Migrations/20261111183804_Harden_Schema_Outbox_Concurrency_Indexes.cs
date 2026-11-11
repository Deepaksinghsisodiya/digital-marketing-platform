using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Harden_Schema_Outbox_Concurrency_Indexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PipelineStages_Category_Value",
                table: "PipelineStages");

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "TaskItems",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AlterColumn<string>(
                name: "SectionVisibilityJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "{}",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "TokenHash",
                table: "PreviewTokens",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeadLetterReason",
                table: "OutboxMessages",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextAttemptAtUtc",
                table: "OutboxMessages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "OutboxMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "Leads",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "FormDefinitions",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "EmailTemplates",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "Clients",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Version",
                table: "BlogPosts",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddCheckConstraint(
                name: "CK_SiteSettings_SectionVisibility_Json",
                table: "SiteSettings",
                sql: "ISJSON([SectionVisibilityJson]) = 1");

            migrationBuilder.CreateIndex(
                name: "IX_PreviewTokens_TokenHash",
                table: "PreviewTokens",
                column: "TokenHash");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category_StageKey",
                table: "PipelineStages",
                columns: new[] { "Category", "StageKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category_Value",
                table: "PipelineStages",
                columns: new[] { "Category", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessages_Status_NextAttemptAtUtc",
                table: "OutboxMessages",
                columns: new[] { "Status", "NextAttemptAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_NavigationMenus_Key",
                table: "NavigationMenus",
                column: "Key",
                unique: true,
                filter: "[RegionCode] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_SiteSettings_SectionVisibility_Json",
                table: "SiteSettings");

            migrationBuilder.DropIndex(
                name: "IX_PreviewTokens_TokenHash",
                table: "PreviewTokens");

            migrationBuilder.DropIndex(
                name: "IX_PipelineStages_Category_StageKey",
                table: "PipelineStages");

            migrationBuilder.DropIndex(
                name: "IX_PipelineStages_Category_Value",
                table: "PipelineStages");

            migrationBuilder.DropIndex(
                name: "IX_OutboxMessages_Status_NextAttemptAtUtc",
                table: "OutboxMessages");

            migrationBuilder.DropIndex(
                name: "IX_NavigationMenus_Key",
                table: "NavigationMenus");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "TaskItems");

            migrationBuilder.DropColumn(
                name: "TokenHash",
                table: "PreviewTokens");

            migrationBuilder.DropColumn(
                name: "DeadLetterReason",
                table: "OutboxMessages");

            migrationBuilder.DropColumn(
                name: "NextAttemptAtUtc",
                table: "OutboxMessages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "OutboxMessages");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "FormDefinitions");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "EmailTemplates");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "BlogPosts");

            migrationBuilder.AlterColumn<string>(
                name: "SectionVisibilityJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "{}");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category_Value",
                table: "PipelineStages",
                columns: new[] { "Category", "Value" });
        }
    }
}
