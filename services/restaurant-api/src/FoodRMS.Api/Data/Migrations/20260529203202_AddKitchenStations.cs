using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddKitchenStations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                schema: "template_tenant",
                table: "OrderItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "KitchenStations",
                schema: "template_tenant",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KitchenStations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KitchenStations_Branches_BranchId",
                        column: x => x.BranchId,
                        principalSchema: "template_tenant",
                        principalTable: "Branches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_KitchenStations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems",
                column: "KitchenStationId");

            migrationBuilder.CreateIndex(
                name: "IX_KitchenStations_BranchId",
                schema: "template_tenant",
                table: "KitchenStations",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_KitchenStations_TenantId",
                schema: "template_tenant",
                table: "KitchenStations",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_KitchenStations_KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems",
                column: "KitchenStationId",
                principalSchema: "template_tenant",
                principalTable: "KitchenStations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_KitchenStations_KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems");

            migrationBuilder.DropTable(
                name: "KitchenStations",
                schema: "template_tenant");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "template_tenant",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "KitchenStationId",
                schema: "template_tenant",
                table: "MenuItems");
        }
    }
}
