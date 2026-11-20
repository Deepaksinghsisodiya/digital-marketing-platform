using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_OgImageUrl_And_RedirectRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RedirectRulesJson",
                table: "SiteSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OgImageUrl",
                table: "Pages",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RedirectRulesJson",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "OgImageUrl",
                table: "Pages");
        }
    }
}
