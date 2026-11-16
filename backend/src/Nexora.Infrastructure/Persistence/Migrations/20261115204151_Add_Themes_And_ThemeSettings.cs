using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Themes_And_ThemeSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AdminThemeEnabled",
                table: "SiteSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminThemeId",
                table: "SiteSettings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "cyber-emerald");

            migrationBuilder.AddColumn<string>(
                name: "FallbackThemeId",
                table: "SiteSettings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "cyber-emerald");

            migrationBuilder.AddColumn<bool>(
                name: "GlobalThemeEngineEnabled",
                table: "SiteSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "WebsiteThemeEnabled",
                table: "SiteSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteThemeId",
                table: "SiteSettings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "cyber-emerald");

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DraftConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CurrentVersion = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Version = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                    table.CheckConstraint("CK_Themes_ConfigJson_Json", "ISJSON([ConfigJson]) = 1");
                    table.CheckConstraint("CK_Themes_DraftConfigJson_Json", "ISJSON([DraftConfigJson]) = 1 OR [DraftConfigJson] IS NULL");
                });

            migrationBuilder.CreateTable(
                name: "ThemeVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ThemeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    ConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChangeDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThemeVersions", x => x.Id);
                    table.CheckConstraint("CK_ThemeVersions_ConfigJson_Json", "ISJSON([ConfigJson]) = 1");
                    table.ForeignKey(
                        name: "FK_ThemeVersions_Themes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Themes_IsDefault",
                table: "Themes",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_Themes_IsDeleted",
                table: "Themes",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Themes_IsSystem",
                table: "Themes",
                column: "IsSystem");

            migrationBuilder.CreateIndex(
                name: "IX_Themes_Slug",
                table: "Themes",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ThemeVersions_ThemeId_VersionNumber",
                table: "ThemeVersions",
                columns: new[] { "ThemeId", "VersionNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThemeVersions");

            migrationBuilder.DropTable(
                name: "Themes");

            migrationBuilder.DropColumn(
                name: "AdminThemeEnabled",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "AdminThemeId",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "FallbackThemeId",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "GlobalThemeEngineEnabled",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "WebsiteThemeEnabled",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "WebsiteThemeId",
                table: "SiteSettings");
        }
    }
}
