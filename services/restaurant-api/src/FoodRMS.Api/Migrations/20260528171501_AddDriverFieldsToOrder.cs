using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodRMS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDriverFieldsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DriverName",
                schema: "template_tenant",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DriverPhone",
                schema: "template_tenant",
                table: "Orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DriverName",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DriverPhone",
                schema: "template_tenant",
                table: "Orders");
        }
    }
}
