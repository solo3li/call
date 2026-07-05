using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCoordinatesToZonesAndAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Coordinates",
                schema: "template_tenant",
                table: "DeliveryZones",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                schema: "template_tenant",
                table: "CustomerAddresses",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                schema: "template_tenant",
                table: "CustomerAddresses",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Coordinates",
                schema: "template_tenant",
                table: "DeliveryZones");

            migrationBuilder.DropColumn(
                name: "Latitude",
                schema: "template_tenant",
                table: "CustomerAddresses");

            migrationBuilder.DropColumn(
                name: "Longitude",
                schema: "template_tenant",
                table: "CustomerAddresses");
        }
    }
}
