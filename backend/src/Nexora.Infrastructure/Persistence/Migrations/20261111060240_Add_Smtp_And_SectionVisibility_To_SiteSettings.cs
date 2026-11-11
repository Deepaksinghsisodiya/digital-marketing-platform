using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Smtp_And_SectionVisibility_To_SiteSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SectionVisibilityJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmtpFromEmail",
                table: "SiteSettings",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmtpFromName",
                table: "SiteSettings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmtpHost",
                table: "SiteSettings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SmtpIsConfigured",
                table: "SiteSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SmtpPassword",
                table: "SiteSettings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SmtpPort",
                table: "SiteSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "SmtpUseSsl",
                table: "SiteSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SmtpUserName",
                table: "SiteSettings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SectionVisibilityJson",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpFromEmail",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpFromName",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpHost",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpIsConfigured",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpPassword",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpPort",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpUseSsl",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SmtpUserName",
                table: "SiteSettings");
        }
    }
}
