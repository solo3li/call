using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Data
{
    public class FoodRMSDbContext : IdentityDbContext<User, AppRole, Guid>
    {
        private readonly ITenantService _tenantService;

        public FoodRMSDbContext(DbContextOptions<FoodRMSDbContext> options, ITenantService tenantService)
            : base(options)
        {
            _tenantService = tenantService;
        }

        // Global / public schema
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<SupportMessage> SupportMessages { get; set; }
        public DbSet<CasbinRule> CasbinRules { get; set; }

        // AI and Telephony Global tables
        public DbSet<VoiceDialect> VoiceDialects { get; set; }
        public DbSet<VoiceEmotion> VoiceEmotions { get; set; }
        public DbSet<VoiceStyle> VoiceStyles { get; set; }
        public DbSet<VoiceProfile> VoiceProfiles { get; set; }
        public DbSet<TenantAiSetting> TenantAiSettings { get; set; }
        public DbSet<TenantSipSetting> TenantSipSettings { get; set; }
        public DbSet<CallRecord> CallRecords { get; set; }

        // Per-tenant schema
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<DeliveryZone> DeliveryZones { get; set; }
        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderAudit> OrderAudits { get; set; }
        public DbSet<DeliveryTrip> DeliveryTrips { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserTenant> UserTenants { get; set; }
        public DbSet<BusinessDay> BusinessDays { get; set; }
        public DbSet<KitchenStation> KitchenStations { get; set; }
        public DbSet<ExternalCompany> ExternalCompanies { get; set; }

        // Helper property for query filter
        public Guid CurrentTenantId => _tenantService.TenantId;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            if (Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                var tenantId = CurrentTenantId;
                var schemaName = tenantId == Guid.Empty ? "template_tenant" : $"tenant_{tenantId:N}";

                // Set default schema for per-tenant tables
                builder.HasDefaultSchema(schemaName);

                // -------------------------------------------------------
                // PUBLIC SCHEMA — Global tables (shared across tenants)
                // -------------------------------------------------------
                // Global tables in public schema
                builder.Entity<Currency>().ToTable("Currencies", "public");

                builder.Entity<Tenant>(entity =>
                {
                    entity.ToTable("Tenants", "public");
                    entity.HasOne(t => t.Plan).WithMany(p => p.Tenants).HasForeignKey(t => t.PlanId);
                    entity.HasOne(t => t.Currency).WithMany(c => c.Tenants).HasForeignKey(t => t.CurrencyId);
                });
                builder.Entity<Permission>().ToTable("Permissions", "public");
                builder.Entity<Plan>().ToTable("Plans", "public");
                builder.Entity<SupportTicket>().ToTable("SupportTickets", "public");
                builder.Entity<SupportMessage>().ToTable("SupportMessages", "public");
                builder.Entity<CasbinRule>().ToTable("CasbinRules", "public");
                builder.Entity<UserTenant>().ToTable("UserTenants", "public");

                builder.Entity<VoiceDialect>().ToTable("VoiceDialects", "public");
                builder.Entity<VoiceEmotion>().ToTable("VoiceEmotions", "public");
                builder.Entity<VoiceStyle>().ToTable("VoiceStyles", "public");
                builder.Entity<VoiceProfile>().ToTable("VoiceProfiles", "public");
                
                builder.Entity<TenantAiSetting>(entity => {
                    entity.ToTable("TenantAiSettings", "public");
                    entity.HasOne(t => t.Tenant).WithOne().HasForeignKey<TenantAiSetting>(t => t.TenantId);
                });
                
                builder.Entity<TenantSipSetting>(entity => {
                    entity.ToTable("TenantSipSettings", "public");
                    entity.HasOne(t => t.Tenant).WithOne().HasForeignKey<TenantSipSetting>(t => t.TenantId);
                });

                builder.Entity<CallRecord>(entity => {
                    entity.ToTable("CallRecords", "public");
                    entity.HasOne(t => t.Tenant).WithMany().HasForeignKey(t => t.TenantId);
                });

                // AppRole — explicit single relationship with Department
                builder.Entity<AppRole>(entity =>
                {
                    entity.HasOne(r => r.Department)
                          .WithMany(d => d.Roles)
                          .HasForeignKey(r => r.DepartmentId)
                          .OnDelete(DeleteBehavior.Restrict);
                });

                // Note: Identity tables and RolePermissions will use the default schema (per-tenant)

            }
            else
            {
                // SQLite / InMemory — no schema support, everything flat
                builder.Entity<Currency>().ToTable("Currencies");
                builder.Entity<Tenant>().ToTable("Tenants");
                builder.Entity<Permission>().ToTable("Permissions");
                builder.Entity<Plan>().ToTable("Plans");
                builder.Entity<SupportTicket>().ToTable("SupportTickets");
                builder.Entity<SupportMessage>().ToTable("SupportMessages");
                builder.Entity<CasbinRule>().ToTable("CasbinRules");
                builder.Entity<VoiceDialect>().ToTable("VoiceDialects");
                builder.Entity<VoiceEmotion>().ToTable("VoiceEmotions");
                builder.Entity<VoiceStyle>().ToTable("VoiceStyles");
                builder.Entity<VoiceProfile>().ToTable("VoiceProfiles");
                builder.Entity<TenantAiSetting>().ToTable("TenantAiSettings");
                builder.Entity<TenantSipSetting>().ToTable("TenantSipSettings");
                builder.Entity<CallRecord>().ToTable("CallRecords");
            }

            // RolePermission configuration
            builder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => new { e.RoleId, e.PermissionId });
                entity.HasOne(e => e.Role).WithMany(r => r.RolePermissions).HasForeignKey(e => e.RoleId);
                entity.HasOne(e => e.Permission).WithMany(p => p.RolePermissions).HasForeignKey(e => e.PermissionId);
            });

            // Tenant configuration
            builder.Entity<Tenant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Subdomain).IsUnique();
            });

        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Entity.TenantId = _tenantService.TenantId;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
