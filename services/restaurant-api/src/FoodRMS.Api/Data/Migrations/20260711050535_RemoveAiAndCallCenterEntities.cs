using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FoodRMS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAiAndCallCenterEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CallRecords",
                schema: "public");

            migrationBuilder.DropTable(
                name: "TenantAiSettings",
                schema: "public");

            migrationBuilder.DropTable(
                name: "TenantSipSettings",
                schema: "public");

            migrationBuilder.DropTable(
                name: "VoiceDialects",
                schema: "public");

            migrationBuilder.DropTable(
                name: "VoiceEmotions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "VoiceProfiles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "VoiceStyles",
                schema: "public");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CallRecords",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CallStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CallerNumber = table.Column<string>(type: "text", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    HandledByAi = table.Column<bool>(type: "boolean", nullable: false),
                    RecordingUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CallRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CallRecords_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantSipSettings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AgentExtension = table.Column<string>(type: "text", nullable: false),
                    AgentPassword = table.Column<string>(type: "text", nullable: false),
                    DidNumber = table.Column<string>(type: "text", nullable: false),
                    MaxChannels = table.Column<int>(type: "integer", nullable: false),
                    TrunkHost = table.Column<string>(type: "text", nullable: false),
                    TrunkPassword = table.Column<string>(type: "text", nullable: false),
                    TrunkPort = table.Column<int>(type: "integer", nullable: false),
                    TrunkUsername = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSipSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSipSettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VoiceDialects",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceDialects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VoiceEmotions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceEmotions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VoiceProfiles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Accent = table.Column<string>(type: "text", nullable: false),
                    DemoAudio = table.Column<string>(type: "text", nullable: false),
                    GeminiVoice = table.Column<string>(type: "text", nullable: false),
                    Gender = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    VoiceName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VoiceStyles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceStyles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantAiSettings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    VoiceDialectId = table.Column<long>(type: "bigint", nullable: true),
                    VoiceEmotionId = table.Column<long>(type: "bigint", nullable: true),
                    VoiceProfileId = table.Column<long>(type: "bigint", nullable: true),
                    VoiceStyleId = table.Column<long>(type: "bigint", nullable: true),
                    EscalationExtension = table.Column<string>(type: "text", nullable: false),
                    IsAiActive = table.Column<bool>(type: "boolean", nullable: false),
                    SystemPrompt = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantAiSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantAiSettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantAiSettings_VoiceDialects_VoiceDialectId",
                        column: x => x.VoiceDialectId,
                        principalSchema: "public",
                        principalTable: "VoiceDialects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TenantAiSettings_VoiceEmotions_VoiceEmotionId",
                        column: x => x.VoiceEmotionId,
                        principalSchema: "public",
                        principalTable: "VoiceEmotions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TenantAiSettings_VoiceProfiles_VoiceProfileId",
                        column: x => x.VoiceProfileId,
                        principalSchema: "public",
                        principalTable: "VoiceProfiles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TenantAiSettings_VoiceStyles_VoiceStyleId",
                        column: x => x.VoiceStyleId,
                        principalSchema: "public",
                        principalTable: "VoiceStyles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CallRecords_TenantId",
                schema: "public",
                table: "CallRecords",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAiSettings_TenantId",
                schema: "public",
                table: "TenantAiSettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantAiSettings_VoiceDialectId",
                schema: "public",
                table: "TenantAiSettings",
                column: "VoiceDialectId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAiSettings_VoiceEmotionId",
                schema: "public",
                table: "TenantAiSettings",
                column: "VoiceEmotionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAiSettings_VoiceProfileId",
                schema: "public",
                table: "TenantAiSettings",
                column: "VoiceProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAiSettings_VoiceStyleId",
                schema: "public",
                table: "TenantAiSettings",
                column: "VoiceStyleId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSipSettings_TenantId",
                schema: "public",
                table: "TenantSipSettings",
                column: "TenantId",
                unique: true);
        }
    }
}
