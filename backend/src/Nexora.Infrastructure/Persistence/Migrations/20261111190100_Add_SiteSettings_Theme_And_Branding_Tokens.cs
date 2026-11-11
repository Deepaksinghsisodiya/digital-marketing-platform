using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_SiteSettings_Theme_And_Branding_Tokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnnouncementBarJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.AddColumn<string>(
                name: "BookingUrl",
                table: "SiteSettings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FaviconMediaId",
                table: "SiteSettings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SocialLinksJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.AddColumn<string>(
                name: "ThemeTokensJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.AddColumn<string>(
                name: "TrackingCodesJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SiteSettings_AnnouncementBar_Json",
                table: "SiteSettings",
                sql: "ISJSON([AnnouncementBarJson]) = 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SiteSettings_SocialLinks_Json",
                table: "SiteSettings",
                sql: "ISJSON([SocialLinksJson]) = 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SiteSettings_ThemeTokens_Json",
                table: "SiteSettings",
                sql: "ISJSON([ThemeTokensJson]) = 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SiteSettings_TrackingCodes_Json",
                table: "SiteSettings",
                sql: "ISJSON([TrackingCodesJson]) = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_SiteSettings_AnnouncementBar_Json",
                table: "SiteSettings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SiteSettings_SocialLinks_Json",
                table: "SiteSettings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SiteSettings_ThemeTokens_Json",
                table: "SiteSettings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SiteSettings_TrackingCodes_Json",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "AnnouncementBarJson",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "BookingUrl",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "FaviconMediaId",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SocialLinksJson",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "ThemeTokensJson",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "TrackingCodesJson",
                table: "SiteSettings");
        }
    }
}
