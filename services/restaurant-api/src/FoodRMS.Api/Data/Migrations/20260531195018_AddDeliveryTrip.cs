using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryTripId",
                schema: "template_tenant",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DeliveryTrips",
                schema: "template_tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripNumber = table.Column<string>(type: "text", nullable: false),
                    DriverName = table.Column<string>(type: "text", nullable: false),
                    DriverPhone = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryTrips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryTrips_Branches_BranchId",
                        column: x => x.BranchId,
                        principalSchema: "template_tenant",
                        principalTable: "Branches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DeliveryTrips_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeliveryTripId",
                schema: "template_tenant",
                table: "Orders",
                column: "DeliveryTripId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryTrips_BranchId",
                schema: "template_tenant",
                table: "DeliveryTrips",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryTrips_TenantId",
                schema: "template_tenant",
                table: "DeliveryTrips",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliveryTrips_DeliveryTripId",
                schema: "template_tenant",
                table: "Orders",
                column: "DeliveryTripId",
                principalSchema: "template_tenant",
                principalTable: "DeliveryTrips",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliveryTrips_DeliveryTripId",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "DeliveryTrips",
                schema: "template_tenant");

            migrationBuilder.DropIndex(
                name: "IX_Orders_DeliveryTripId",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryTripId",
                schema: "template_tenant",
                table: "Orders");
        }
    }
}
