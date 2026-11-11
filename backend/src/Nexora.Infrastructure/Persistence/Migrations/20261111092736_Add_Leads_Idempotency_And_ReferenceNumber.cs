using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nexora.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Leads_Idempotency_And_ReferenceNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "Leads",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNumber",
                table: "Leads",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TimeTrapNonce",
                table: "Leads",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_FormKey_IdempotencyKey",
                table: "Leads",
                columns: new[] { "FormKey", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_ReferenceNumber",
                table: "Leads",
                column: "ReferenceNumber",
                unique: true,
                filter: "[ReferenceNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TimeTrapNonce",
                table: "Leads",
                column: "TimeTrapNonce",
                unique: true,
                filter: "[TimeTrapNonce] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Leads_FormKey_IdempotencyKey",
                table: "Leads");

            migrationBuilder.DropIndex(
                name: "IX_Leads_ReferenceNumber",
                table: "Leads");

            migrationBuilder.DropIndex(
                name: "IX_Leads_TimeTrapNonce",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ReferenceNumber",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "TimeTrapNonce",
                table: "Leads");
        }
    }
}
