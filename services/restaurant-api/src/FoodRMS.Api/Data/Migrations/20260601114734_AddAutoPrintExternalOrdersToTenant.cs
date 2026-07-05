using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoPrintExternalOrdersToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoPrintExternalOrders",
                schema: "public",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoPrintExternalOrders",
                schema: "public",
                table: "Tenants");
        }
    }
}
