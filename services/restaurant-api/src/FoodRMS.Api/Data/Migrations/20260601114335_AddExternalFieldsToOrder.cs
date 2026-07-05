using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalFieldsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                schema: "template_tenant",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalOrderId",
                schema: "template_tenant",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders",
                column: "ExternalCompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ExternalCompanies_ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders",
                column: "ExternalCompanyId",
                principalSchema: "template_tenant",
                principalTable: "ExternalCompanies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ExternalCompanies_ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ExternalCompanyId",
                schema: "template_tenant",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ExternalOrderId",
                schema: "template_tenant",
                table: "Orders");
        }
    }
}
