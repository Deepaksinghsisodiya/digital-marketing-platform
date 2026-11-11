using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Lead_Scoring_And_Webhooks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WebhookSecret",
                table: "SiteSettings",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebhookUrl",
                table: "SiteSettings",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Score",
                table: "Leads",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WebhookSecret",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "WebhookUrl",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "Leads");
        }
    }
}
