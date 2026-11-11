using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Dynamic_Pipeline_And_CountryRegions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CountryRegions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CurrencySymbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FlagEmoji = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PhonePrefix = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TaxLabel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CountryRegions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PipelineStages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StageKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ColorHex = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BadgeClass = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipelineStages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CountryRegions_Code",
                table: "CountryRegions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CountryRegions_OrderIndex",
                table: "CountryRegions",
                column: "OrderIndex");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category_OrderIndex",
                table: "PipelineStages",
                columns: new[] { "Category", "OrderIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_PipelineStages_Category_Value",
                table: "PipelineStages",
                columns: new[] { "Category", "Value" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CountryRegions");

            migrationBuilder.DropTable(
                name: "PipelineStages");
        }
    }
}
