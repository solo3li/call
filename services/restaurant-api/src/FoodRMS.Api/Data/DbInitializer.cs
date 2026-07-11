using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();

            // First, migrate the global/template schema (CurrentTenantId = Empty)
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }
            else
            {
                context.Database.EnsureCreated();
            }

            // 0a. Seed Global Plans
            if (!context.Plans.Any())
            {
                var plans = new List<Plan>
                {
                    new() { Id = Guid.NewGuid(), Name = "Basic", Price = 99, MaxBranches = 5, MaxEmployees = 20, IsCustom = false },
                    new() { Id = Guid.NewGuid(), Name = "Pro", Price = 299, MaxBranches = 10, MaxEmployees = 50, IsCustom = false },
                    new() { Id = Guid.NewGuid(), Name = "Enterprise", Price = 999, MaxBranches = 50, MaxEmployees = 200, IsCustom = false }
                };
                context.Plans.AddRange(plans);
                await context.SaveChangesAsync();
            }

            var basicPlan = await context.Plans.FirstOrDefaultAsync(p => p.Name == "Basic");
            var proPlan = await context.Plans.FirstOrDefaultAsync(p => p.Name == "Pro");
            var enterprisePlan = await context.Plans.FirstOrDefaultAsync(p => p.Name == "Enterprise");

            // 0a1. Seed Global Currencies
            if (!context.Currencies.Any())
            {
                var currencies = new List<Currency>
                {
                    new() { Id = Guid.NewGuid(), Name = "ريال سعودي", Code = "SAR", Symbol = "ر.س", IsActive = true },
                    new() { Id = Guid.NewGuid(), Name = "US Dollar", Code = "USD", Symbol = "$", IsActive = true },
                    new() { Id = Guid.NewGuid(), Name = "Euro", Code = "EUR", Symbol = "€", IsActive = true },
                    new() { Id = Guid.NewGuid(), Name = "درهم إماراتي", Code = "AED", Symbol = "د.إ", IsActive = true },
                    new() { Id = Guid.NewGuid(), Name = "جنيه مصري", Code = "EGP", Symbol = "ج.م", IsActive = true },
                    new() { Id = Guid.NewGuid(), Name = "دينار كويتي", Code = "KWD", Symbol = "د.ك", IsActive = true }
                };
                context.Currencies.AddRange(currencies);
                await context.SaveChangesAsync();
            }


            // 0c. Seed Global Permissions
            if (!context.Permissions.Any())
            {
                var permissions = new List<Permission>
                {
                    // --- ORDERS ---
                    new() { Id = Guid.NewGuid(), Name = "عرض الطلبات", Code = "Orders.View", Group = "الطلبات" },
                    new() { Id = Guid.NewGuid(), Name = "إنشاء طلب جديد", Code = "Orders.Create", Group = "الطلبات" },
                    new() { Id = Guid.NewGuid(), Name = "تعديل الطلبات", Code = "Orders.Edit", Group = "الطلبات" },
                    new() { Id = Guid.NewGuid(), Name = "إلغاء/حذف الطلبات", Code = "Orders.Void", Group = "الطلبات" },
                    new() { Id = Guid.NewGuid(), Name = "تغيير حالة الطلب", Code = "Orders.Status", Group = "الطلبات" },
                    new() { Id = Guid.NewGuid(), Name = "إدارة المرتجعات", Code = "Orders.Refund", Group = "الطلبات" },

                    // --- MENU ---
                    new() { Id = Guid.NewGuid(), Name = "عرض القائمة", Code = "Menu.View", Group = "القائمة" },
                    new() { Id = Guid.NewGuid(), Name = "إضافة أصناف جديدة", Code = "Menu.CreateItem", Group = "القائمة" },
                    new() { Id = Guid.NewGuid(), Name = "تعديل الأصناف والأسعار", Code = "Menu.EditItem", Group = "القائمة" },
                    new() { Id = Guid.NewGuid(), Name = "حذف الأصناف", Code = "Menu.DeleteItem", Group = "القائمة" },
                    new() { Id = Guid.NewGuid(), Name = "إدارة التصنيفات", Code = "Menu.ManageCategories", Group = "القائمة" },
                    new() { Id = Guid.NewGuid(), Name = "التحكم في التوفر (متاح/نفذ)", Code = "Menu.ToggleAvailability", Group = "القائمة" },

                    // --- STAFF ---
                    new() { Id = Guid.NewGuid(), Name = "عرض الموظفين", Code = "Staff.View", Group = "الموظفين" },
                    new() { Id = Guid.NewGuid(), Name = "إضافة موظفين جدد", Code = "Staff.Create", Group = "الموظفين" },
                    new() { Id = Guid.NewGuid(), Name = "تعديل بيانات الموظفين", Code = "Staff.Edit", Group = "الموظفين" },
                    new() { Id = Guid.NewGuid(), Name = "حذف الموظفين", Code = "Staff.Delete", Group = "الموظفين" },
                    new() { Id = Guid.NewGuid(), Name = "إدارة الأدوار والصلاحيات", Code = "Staff.ManageRoles", Group = "الموظفين" },
                    new() { Id = Guid.NewGuid(), Name = "عرض تقارير الأداء للموظفين", Code = "Staff.Performance", Group = "الموظفين" },

                    // --- ANALYTICS ---
                    new() { Id = Guid.NewGuid(), Name = "عرض التقارير المالية", Code = "Analytics.Financial", Group = "التقارير" },
                    new() { Id = Guid.NewGuid(), Name = "عرض تقارير المبيعات", Code = "Analytics.Sales", Group = "التقارير" },
                    new() { Id = Guid.NewGuid(), Name = "عرض تقارير المخزون", Code = "Analytics.Inventory", Group = "التقارير" },
                    new() { Id = Guid.NewGuid(), Name = "تصدير البيانات والتقارير", Code = "Analytics.Export", Group = "التقارير" },

                    // --- CUSTOMERS ---
                    new() { Id = Guid.NewGuid(), Name = "عرض بيانات العملاء", Code = "Customers.View", Group = "العملاء" },
                    new() { Id = Guid.NewGuid(), Name = "إضافة/تعديل العملاء", Code = "Customers.Manage", Group = "العملاء" },
                    new() { Id = Guid.NewGuid(), Name = "عرض سجل طلبات العملاء", Code = "Customers.History", Group = "العملاء" },

                    // --- SETTINGS ---
                    new() { Id = Guid.NewGuid(), Name = "إعدادات المطعم العامة", Code = "Settings.General", Group = "الإعدادات" },
                    new() { Id = Guid.NewGuid(), Name = "إعدادات الفروع", Code = "Settings.Branches", Group = "الإعدادات" },
                    new() { Id = Guid.NewGuid(), Name = "إعدادات البوت والتلجرام", Code = "Settings.Bot", Group = "الإعدادات" },
                    new() { Id = Guid.NewGuid(), Name = "إدارة الاشتراك والدفع", Code = "Settings.Subscription", Group = "الإعدادات" }
                };
                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }
            var allPermissions = await context.Permissions.ToListAsync();

            // --- TENANT 1: FoodRMS Demo ---
            var tenant1Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
            await ProvisionAndSeedTenant(serviceProvider, tenant1Id, "FoodRMS Demo", "demo", "admin@foodrms.com", basicPlan?.Id, allPermissions, new List<(string Name, string Icon, string ImageUrl)> 
            {
                ("وجبات رئيسية", "🍔", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"), 
                ("مقبلات", "🍟", "https://images.unsplash.com/photo-1573015084184-b9a677c7725b?auto=format&fit=crop&w=800&q=80"), 
                ("مشروبات", "🥤", "https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&w=800&q=80"), 
                ("حلويات", "🍰", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80")
            });

            // --- TENANT 2: Burger House ---
            var tenant2Id = Guid.Parse("660e8400-e29b-41d4-a716-446655440001");
            await ProvisionAndSeedTenant(serviceProvider, tenant2Id, "Burger House", "burgerhouse", "owner@burger.com", proPlan?.Id, allPermissions, new List<(string Name, string Icon, string ImageUrl)>
            {
                ("برجر لحم", "🥩", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"), 
                ("برجر دجاج", "🍗", "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80"), 
                ("بطاطس ومقبلات", "🍟", "https://images.unsplash.com/photo-1573015084184-b9a677c7725b?auto=format&fit=crop&w=800&q=80"), 
                ("ميلك شيك", "🍦", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80")
            });

            // --- TENANT 3: Sushi Zen ---
            var tenant3Id = Guid.Parse("770e8400-e29b-41d4-a716-446655440002");
            await ProvisionAndSeedTenant(serviceProvider, tenant3Id, "Sushi Zen", "sushizen", "owner@sushi.com", enterprisePlan?.Id, allPermissions, new List<(string Name, string Icon, string ImageUrl)>
            {
                ("سوشي رول", "🍣", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80"), 
                ("نيجيري", "🥢", "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=800&q=80"), 
                ("رامن", "🍜", "https://images.unsplash.com/photo-1557872246-7fa79be63bc0?auto=format&fit=crop&w=800&q=80"), 
                ("أطباق جانبية", "🥗", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80")
            });

            // --- SEED 20 ADDITIONAL TENANTS ---
            var restaurantTypes = new[] 
            { 
                (Name: "Pizzeria", Icon: "🍕", Categories: new[] {"Margherita", "Pepperoni", "Vegetarian", "Sides"}),
                (Name: "Steakhouse", Icon: "🥩", Categories: new[] {"Ribeye", "Sirloin", "T-Bone", "Beverages"}),
                (Name: "Coffee Shop", Icon: "☕", Categories: new[] {"Espresso", "Latte", "Pastries", "Snacks"}),
                (Name: "Ice Cream Parlor", Icon: "🍦", Categories: new[] {"Scoops", "Sundae", "Shakes", "Waffles"}),
                (Name: "Taco Bell", Icon: "🌮", Categories: new[] {"Tacos", "Burritos", "Nachos", "Dips"}),
                (Name: "Indian Spices", Icon: "🍛", Categories: new[] {"Curry", "Naan", "Biryani", "Lassi"}),
                (Name: "Waffle House", Icon: "🧇", Categories: new[] {"Waffles", "Pancakes", "Syrups", "Juices"}),
                (Name: "Seafood Grill", Icon: "🦐", Categories: new[] {"Shrimp", "Lobster", "Fish", "Salads"})
            };

            var availablePlans = new[] { basicPlan, proPlan, enterprisePlan };

            for (int i = 1; i <= 3; i++)
            {
                var type = restaurantTypes[i % restaurantTypes.Length];
                var tenantId = new Guid($"880e8400-e29b-41d4-a716-4466554400{i:D2}");
                var subdomain = $"tenant{i}";
                var name = $"{type.Name} #{i}";
                var email = $"admin@tenant{i}.com";
                var plan = availablePlans[i % availablePlans.Length];
                
                var categories = type.Categories.Select(cat => (Name: cat, Icon: type.Icon, ImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80")).ToList();

                await ProvisionAndSeedTenant(serviceProvider, tenantId, name, subdomain, email, plan?.Id, allPermissions, categories);
            }

            // Ensure ALL tenants in the database (including user-registered ones) have the required schema columns
            if (context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                var allTenants = await context.Tenants.IgnoreQueryFilters().ToListAsync();
                Console.WriteLine($"Synchronizing schemas for {allTenants.Count} tenants...");
                foreach (var t in allTenants)
                {
                    var schemaName = $"tenant_{t.Id:N}";
                    Console.WriteLine($"Checking schema: {schemaName}");
                    try
                    {
                        await context.Database.ExecuteSqlRawAsync($"CREATE SCHEMA IF NOT EXISTS {schemaName}");
                        
                        // Check if Orders table exists before trying to alter it
                        var tableExists = await context.Database.ExecuteSqlRawAsync(
                            $"SELECT 1 FROM information_schema.tables WHERE table_schema = '{schemaName}' AND table_name = 'Orders'") > 0;

                        if (true) // We will use IF NOT EXISTS anyway
                        {
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"IsRecurring\" boolean NOT NULL DEFAULT FALSE;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"KitchenNotes\" text NOT NULL DEFAULT '';");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"CustomerAddressId\" integer NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DeliveryCost\" numeric NOT NULL DEFAULT 0;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DriverName\" text NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DriverPhone\" text NULL;");
                            
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuItems\" ADD COLUMN IF NOT EXISTS \"IsAvailable\" boolean NOT NULL DEFAULT TRUE;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuItems\" ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NOT NULL DEFAULT '';");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuCategories\" ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NOT NULL DEFAULT '';");
                            await context.Database.ExecuteSqlRawAsync($"UPDATE \"{schemaName}\".\"MenuItems\" SET \"IsAvailable\" = TRUE WHERE \"IsAvailable\" = FALSE;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"CustomerPreferences\" text NOT NULL DEFAULT '';");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"SavedFavorites\" text NOT NULL DEFAULT '';");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"TelegramChatId\" bigint NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"IsDelivery\" boolean NOT NULL DEFAULT FALSE;");

                            // External Delivery columns
                            await context.Database.ExecuteSqlRawAsync($@"
                                CREATE TABLE IF NOT EXISTS ""{schemaName}"".""ExternalCompanies"" (
                                    ""Id"" uuid NOT NULL,
                                    ""Name"" text NOT NULL,
                                    ""IsActive"" boolean NOT NULL DEFAULT TRUE,
                                    ""CreatedAt"" timestamp with time zone NOT NULL,
                                    ""UpdatedAt"" timestamp with time zone NOT NULL,
                                    ""TenantId"" uuid NOT NULL,
                                    CONSTRAINT ""PK_ExternalCompanies_{t.Id:N}"" PRIMARY KEY (""Id""),
                                    CONSTRAINT ""FK_ExternalCompanies_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                                );");

                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"IsExternalDelivery\" boolean NOT NULL DEFAULT FALSE;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"ExternalCompanyId\" uuid NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"ExternalOrderId\" text NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"CustomerPhone\" text NULL;");

                            try {
                                await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD CONSTRAINT \"FK_Orders_ExternalCompanies_{t.Id:N}\" FOREIGN KEY (\"ExternalCompanyId\") REFERENCES \"{schemaName}\".\"ExternalCompanies\" (\"Id\") ON DELETE SET NULL;");
                            } catch { }

                            await context.Database.ExecuteSqlRawAsync($@"
                                CREATE TABLE IF NOT EXISTS ""{schemaName}"".""DeliveryZones"" (
                                    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                                    ""Name"" text NOT NULL,
                                    ""DeliveryCost"" numeric NOT NULL,
                                    ""BranchId"" uuid NOT NULL,
                                    ""TenantId"" uuid NOT NULL,
                                    CONSTRAINT ""PK_DeliveryZones_{t.Id:N}"" PRIMARY KEY (""Id""),
                                    CONSTRAINT ""FK_DeliveryZones_Branches_BranchId"" FOREIGN KEY (""BranchId"") REFERENCES ""{schemaName}"".""Branches"" (""Id"") ON DELETE CASCADE,
                                    CONSTRAINT ""FK_DeliveryZones_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                                );");

                            await context.Database.ExecuteSqlRawAsync($@"
                                CREATE TABLE IF NOT EXISTS ""{schemaName}"".""CustomerAddresses"" (
                                    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                                    ""AddressDetails"" text NOT NULL,
                                    ""DeliveryZoneId"" integer,
                                    ""CustomerId"" uuid NOT NULL,
                                    ""TenantId"" uuid NOT NULL,
                                    CONSTRAINT ""PK_CustomerAddresses_{t.Id:N}"" PRIMARY KEY (""Id""),
                                    CONSTRAINT ""FK_CustomerAddresses_Customers_CustomerId"" FOREIGN KEY (""CustomerId"") REFERENCES ""{schemaName}"".""Customers"" (""Id"") ON DELETE CASCADE,
                                    CONSTRAINT ""FK_CustomerAddresses_DeliveryZones_DeliveryZoneId"" FOREIGN KEY (""DeliveryZoneId"") REFERENCES ""{schemaName}"".""DeliveryZones"" (""Id""),
                                    CONSTRAINT ""FK_CustomerAddresses_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                                );");

                            await context.Database.ExecuteSqlRawAsync($@"
                                CREATE TABLE IF NOT EXISTS ""{schemaName}"".""OrderAudits"" (
                                    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                                    ""OrderId"" integer NOT NULL,
                                    ""UserId"" uuid NULL,
                                    ""UserName"" text NOT NULL DEFAULT '',
                                    ""Action"" text NOT NULL,
                                    ""Changes"" text NOT NULL,
                                    ""Timestamp"" timestamp with time zone NOT NULL,
                                    ""TenantId"" uuid NOT NULL,
                                    CONSTRAINT ""PK_OrderAudits_{t.Id:N}"" PRIMARY KEY (""Id""),
                                    CONSTRAINT ""FK_OrderAudits_Orders_OrderId"" FOREIGN KEY (""OrderId"") REFERENCES ""{schemaName}"".""Orders"" (""Id"") ON DELETE CASCADE,
                                    CONSTRAINT ""FK_OrderAudits_AspNetUsers_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""{schemaName}"".""AspNetUsers"" (""Id"") ON DELETE SET NULL
                                );");

                            await context.Database.ExecuteSqlRawAsync($"CREATE INDEX IF NOT EXISTS \"IX_Orders_CustomerAddressId_{t.Id:N}\" ON \"{schemaName}\".\"Orders\" (\"CustomerAddressId\");");

                            // V2: Coordinate columns for zones and addresses
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"DeliveryZones\" ADD COLUMN IF NOT EXISTS \"Coordinates\" text NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"CustomerAddresses\" ADD COLUMN IF NOT EXISTS \"Latitude\" double precision NULL;");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"CustomerAddresses\" ADD COLUMN IF NOT EXISTS \"Longitude\" double precision NULL;");

                            // V3: Kitchen Stations
                            await context.Database.ExecuteSqlRawAsync($@"
                                CREATE TABLE IF NOT EXISTS ""{schemaName}"".""KitchenStations"" (
                                    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                                    ""Name"" text NOT NULL,
                                    ""BranchId"" uuid NULL,
                                    ""TenantId"" uuid NOT NULL,
                                    CONSTRAINT ""PK_KitchenStations_{t.Id:N}"" PRIMARY KEY (""Id""),
                                    CONSTRAINT ""FK_KitchenStations_Branches_BranchId"" FOREIGN KEY (""BranchId"") REFERENCES ""{schemaName}"".""Branches"" (""Id""),
                                    CONSTRAINT ""FK_KitchenStations_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                                );");
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuItems\" ADD COLUMN IF NOT EXISTS \"KitchenStationId\" integer NULL;");
                            
                            // V4: OrderItem Status
                            await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"OrderItems\" ADD COLUMN IF NOT EXISTS \"Status\" integer NOT NULL DEFAULT 0;");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error synchronizing schema for tenant {t.Id}: {ex.Message}");
                    }
                }
            }
            Console.WriteLine("Database seeded successfully.");
        }

        private static async Task ProvisionAndSeedTenant(
            IServiceProvider serviceProvider,
            Guid tenantId,
            string name,
            string subdomain,
            string adminEmail,
            Guid? planId,
            List<Permission> allPermissions,
            List<(string Name, string Icon, string ImageUrl)> categoryData)
        {
            using var scope = serviceProvider.CreateScope();
            var tenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
            tenantService.SetTenant(tenantId);
            
            var context = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();

            // 1. Template-based provisioning / Incremental Migrations
            if (context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                // Ensure public and template schemas have custom columns as failsafe
                var baseSchemas = new[] { "template_tenant" };
                foreach (var schema in baseSchemas)
                {
                    try {
                        await context.Database.ExecuteSqlRawAsync($"CREATE SCHEMA IF NOT EXISTS {schema}");
                        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schema}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TotpSecretKey\" text NULL;");
                        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schema}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TenantId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schema}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Role\" text NOT NULL DEFAULT '';");
                        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schema}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"IsDelivery\" boolean NOT NULL DEFAULT FALSE;");
                    } catch {}
                }

                try
                {
                    var script = context.Database.GenerateCreateScript();
                    var schemaName = $"tenant_{tenantId:N}";
                    
                    // Replace template schema with the actual tenant schema
                    script = script.Replace("\"template_tenant\"", $"\"{schemaName}\"");
                    
                    // Make it idempotent for Postgres
                    script = script.Replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ");
                    script = script.Replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ");
                    script = script.Replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ");
                    
                    await context.Database.ExecuteSqlRawAsync($"CREATE SCHEMA IF NOT EXISTS {schemaName}");
                    try { await context.Database.ExecuteSqlRawAsync(script); } catch { }

                    // Ensure custom columns exist in per-tenant Identity tables
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"FullName\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TenantId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Role\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"BranchId\" uuid NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"OrdersHandled\" integer NOT NULL DEFAULT 0;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Rating\" double precision NOT NULL DEFAULT 0;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Status\" text NOT NULL DEFAULT 'Available';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"DepartmentId\" uuid NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"EmployeeCode\" text NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TotpSecretKey\" text NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"IsDelivery\" boolean NOT NULL DEFAULT FALSE;");

                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetRoles\" ADD COLUMN IF NOT EXISTS \"TenantId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetRoles\" ADD COLUMN IF NOT EXISTS \"DepartmentId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");

                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"IsRecurring\" boolean NOT NULL DEFAULT FALSE;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"KitchenNotes\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"CustomerAddressId\" integer NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DeliveryCost\" numeric NOT NULL DEFAULT 0;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DriverName\" text NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Orders\" ADD COLUMN IF NOT EXISTS \"DriverPhone\" text NULL;");
                    
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"OrderItems\" ADD COLUMN IF NOT EXISTS \"Status\" integer NOT NULL DEFAULT 0;");
                    
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuItems\" ADD COLUMN IF NOT EXISTS \"IsAvailable\" boolean NOT NULL DEFAULT TRUE;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuItems\" ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"MenuCategories\" ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NOT NULL DEFAULT '';");
                    
                    await context.Database.ExecuteSqlRawAsync($"UPDATE \"{schemaName}\".\"MenuItems\" SET \"IsAvailable\" = TRUE WHERE \"IsAvailable\" = FALSE;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"CustomerPreferences\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"SavedFavorites\" text NOT NULL DEFAULT '';");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"Customers\" ADD COLUMN IF NOT EXISTS \"TelegramChatId\" bigint NULL;");

                    await context.Database.ExecuteSqlRawAsync($@"
                        CREATE TABLE IF NOT EXISTS ""{schemaName}"".""DeliveryZones"" (
                            ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                            ""Name"" text NOT NULL,
                            ""DeliveryCost"" numeric NOT NULL,
                            ""BranchId"" uuid NOT NULL,
                            ""TenantId"" uuid NOT NULL,
                            CONSTRAINT ""PK_DeliveryZones_{tenantId:N}"" PRIMARY KEY (""Id""),
                            CONSTRAINT ""FK_DeliveryZones_Branches_BranchId"" FOREIGN KEY (""BranchId"") REFERENCES ""{schemaName}"".""Branches"" (""Id"") ON DELETE CASCADE,
                            CONSTRAINT ""FK_DeliveryZones_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                        );");

                    await context.Database.ExecuteSqlRawAsync($@"
                        CREATE TABLE IF NOT EXISTS ""{schemaName}"".""CustomerAddresses"" (
                            ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                            ""AddressDetails"" text NOT NULL,
                            ""DeliveryZoneId"" integer,
                            ""CustomerId"" uuid NOT NULL,
                            ""TenantId"" uuid NOT NULL,
                            CONSTRAINT ""PK_CustomerAddresses_{tenantId:N}"" PRIMARY KEY (""Id""),
                            CONSTRAINT ""FK_CustomerAddresses_Customers_CustomerId"" FOREIGN KEY (""CustomerId"") REFERENCES ""{schemaName}"".""Customers"" (""Id"") ON DELETE CASCADE,
                            CONSTRAINT ""FK_CustomerAddresses_DeliveryZones_DeliveryZoneId"" FOREIGN KEY (""DeliveryZoneId"") REFERENCES ""{schemaName}"".""DeliveryZones"" (""Id""),
                            CONSTRAINT ""FK_CustomerAddresses_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES public.""Tenants"" (""Id"") ON DELETE CASCADE
                        );");

                    await context.Database.ExecuteSqlRawAsync($@"
                        CREATE TABLE IF NOT EXISTS ""{schemaName}"".""OrderAudits"" (
                            ""Id"" integer GENERATED BY DEFAULT AS IDENTITY,
                            ""OrderId"" integer NOT NULL,
                            ""UserId"" uuid NULL,
                            ""UserName"" text NOT NULL DEFAULT '',
                            ""Action"" text NOT NULL,
                            ""Changes"" text NOT NULL,
                            ""Timestamp"" timestamp with time zone NOT NULL,
                            ""TenantId"" uuid NOT NULL,
                            CONSTRAINT ""PK_OrderAudits_{tenantId:N}"" PRIMARY KEY (""Id""),
                            CONSTRAINT ""FK_OrderAudits_Orders_OrderId"" FOREIGN KEY (""OrderId"") REFERENCES ""{schemaName}"".""Orders"" (""Id"") ON DELETE CASCADE,
                            CONSTRAINT ""FK_OrderAudits_AspNetUsers_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""{schemaName}"".""AspNetUsers"" (""Id"") ON DELETE SET NULL
                        );");

                    await context.Database.ExecuteSqlRawAsync($"CREATE INDEX IF NOT EXISTS \"IX_Orders_CustomerAddressId_{tenantId:N}\" ON \"{schemaName}\".\"Orders\" (\"CustomerAddressId\");");

                    // V2: Coordinate columns for zones and addresses
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"DeliveryZones\" ADD COLUMN IF NOT EXISTS \"Coordinates\" text NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"CustomerAddresses\" ADD COLUMN IF NOT EXISTS \"Latitude\" double precision NULL;");
                    await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"CustomerAddresses\" ADD COLUMN IF NOT EXISTS \"Longitude\" double precision NULL;");
                }
                catch (Exception ex)
                {
                    // Log or handle if needed
                }
            }
            else
            {
                context.Database.EnsureCreated();
            }

            await SeedTenantData(context, userManager, roleManager, tenantId, name, subdomain, adminEmail, planId, allPermissions, categoryData);
        }

        private static async Task SeedTenantData(
            FoodRMSDbContext context, 
            UserManager<User> userManager, 
            RoleManager<AppRole> roleManager,
            Guid tenantId, 
            string name, 
            string subdomain, 
            string adminEmail,
            Guid? planId,
            List<Permission> allPermissions,
            List<(string Name, string Icon, string ImageUrl)> categoryData)
        {
            // IMPORTANT: Bypass filters during seeding
            var tenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId || t.Subdomain == subdomain);
            if (tenant != null)
            {
                tenantId = tenant.Id;
                // If we already have roles for this tenant, assume it's partially or fully seeded and skip to avoid FK issues
                if (await context.Roles.IgnoreQueryFilters().AnyAsync(r => r.TenantId == tenantId)) return;
            }

            if (tenant == null)
            {
                var defaultCurrency = await context.Currencies.FirstOrDefaultAsync(c => c.Code == "SAR");
                tenant = new Tenant
                {
                    Id = tenantId,
                    Name = name,
                    Subdomain = subdomain,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    PlanId = planId,
                    CurrencyId = defaultCurrency?.Id
                };
                if (tenantId == Guid.Parse("550e8400-e29b-41d4-a716-446655440000"))
                {
                    tenant.TelegramBotToken = "8780360075:AAGWaUbusWp3WRzD8wvde5E2pMHca2nr7NI";
                }
                context.Tenants.Add(tenant);
                await context.SaveChangesAsync();
            }

            // 1. Departments
            var depts = new List<Department>
            {
                new() { Id = Guid.NewGuid(), Name = "العمليات", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "المطبخ", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "الإدارة", TenantId = tenantId }
            };
            context.Departments.AddRange(depts);
            await context.SaveChangesAsync();

            // 2. Roles
            var adminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == $"Admin_{subdomain}" && r.TenantId == tenantId);
            if (adminRole == null)
            {
                adminRole = new AppRole { Id = Guid.NewGuid(), Name = $"Admin_{subdomain}", NormalizedName = $"ADMIN_{subdomain}".ToUpper(), TenantId = tenantId, DepartmentId = depts[2].Id };
                context.Roles.Add(adminRole);
            }

            var chefRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == $"Chef_{subdomain}" && r.TenantId == tenantId);
            if (chefRole == null)
            {
                chefRole = new AppRole { Id = Guid.NewGuid(), Name = $"Chef_{subdomain}", NormalizedName = $"CHEF_{subdomain}".ToUpper(), TenantId = tenantId, DepartmentId = depts[1].Id };
                context.Roles.Add(chefRole);
            }

            var cashierRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == $"Cashier_{subdomain}" && r.TenantId == tenantId);
            if (cashierRole == null)
            {
                cashierRole = new AppRole { Id = Guid.NewGuid(), Name = $"Cashier_{subdomain}", NormalizedName = $"CASHIER_{subdomain}".ToUpper(), TenantId = tenantId, DepartmentId = depts[0].Id };
                context.Roles.Add(cashierRole);
            }

            await context.SaveChangesAsync();

            // 3. Role Permissions
            foreach (var p in allPermissions)
            {
                if (!await context.RolePermissions.IgnoreQueryFilters().AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == p.Id))
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
                }
            }
            var chefPerms = allPermissions.Where(p => p.Group == "الطلبات" || p.Group == "القائمة");
            foreach (var p in chefPerms)
            {
                if (!await context.RolePermissions.IgnoreQueryFilters().AnyAsync(rp => rp.RoleId == chefRole.Id && rp.PermissionId == p.Id))
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = chefRole.Id, PermissionId = p.Id });
                }
            }
            await context.SaveChangesAsync();

            // 4. Branches
            var b1Id = new Guid(tenantId.ToString().Replace("-", "").Substring(0, 30) + "b1");
            var b2Id = new Guid(tenantId.ToString().Replace("-", "").Substring(0, 30) + "b2");
            var branches = new List<Branch>();
            
            if (!await context.Branches.AnyAsync(b => b.Id == b1Id))
            {
                branches.Add(new Branch { Id = b1Id, Name = $"{name} - الفرع الرئيسي", Address = "الرياض", TenantId = tenantId, Rating = 4.8, Status = "Open" });
            }
            if (!await context.Branches.AnyAsync(b => b.Id == b2Id))
            {
                branches.Add(new Branch { Id = b2Id, Name = $"{name} - فرع السحاب", Address = "جدة", TenantId = tenantId, Rating = 4.5, Status = "Open" });
            }
            
            if (branches.Any())
            {
                context.Branches.AddRange(branches);
                await context.SaveChangesAsync();
            }
            
            // Re-fetch branches to ensure we have them for the next steps
            branches = await context.Branches.Where(b => b.TenantId == tenantId).ToListAsync();

            // 5. Admin & Staff
            var adminUser = new User
            {
                // Deterministic GUID for admin based on tenantId
                Id = new Guid(tenantId.ToString().Replace("-", "").Substring(0, 30) + "a1"),
                UserName = adminEmail,
                Email = adminEmail,
                FullName = $"مدير {name}",
                TenantId = tenantId,
                Role = "Owner",
                DepartmentId = depts[2].Id,
                TotpSecretKey = "ADMINSECRETKEY222222222222222222"
            };
            await userManager.CreateAsync(adminUser, "Admin123!");
            await userManager.AddToRoleAsync(adminUser, adminRole.Name!);

            // Add to global lookup
            var adminEmailLower = adminUser.Email!.ToLower();
            var adminLookup = await context.UserTenants.FirstOrDefaultAsync(ut => ut.Email == adminEmailLower);
            if (adminLookup == null)
            {
                context.UserTenants.Add(new UserTenant { Email = adminEmailLower, TenantId = tenantId });
            }
            else
            {
                adminLookup.TenantId = tenantId;
            }

            var staffNames = new[] { "أحمد العتيبي", "سارة محمد", "خالد الشمري", "نورة القحطاني", "فيصل التركي", "ريما السعد" };
            var rolesToAssign = new[] { chefRole, cashierRole, chefRole, cashierRole, chefRole, cashierRole };

            var staffUsers = new List<User>();
            for (int i = 0; i < staffNames.Length; i++)
            {
                var roleName = i == 0 ? "Chef" :
                               i == 1 ? "Cashier" :
                               i == 2 ? "Agent" :
                               i == 3 ? "Manager" : "Staff";
                var staffUser = new User
                {
                    // Deterministic GUID for staff
                    Id = new Guid(tenantId.ToString().Replace("-", "").Substring(0, 30) + $"e{i+1}"),
                    UserName = $"staff{i + 1}@{subdomain}.com",
                    Email = $"staff{i + 1}@{subdomain}.com",
                    FullName = staffNames[i],
                    TenantId = tenantId,
                    Role = roleName,
                    BranchId = branches[i % branches.Count].Id,
                    OrdersHandled = 50 + (i * 10),
                    Rating = 4.4 + (i * 0.1),
                    DepartmentId = rolesToAssign[i].DepartmentId,
                    Status = "Available",
                    EmployeeCode = $"EMP10{i + 1}",
                    TotpSecretKey = i == 0 ? "CHEFSECRETKEY2222222222222222222" : 
                                    i == 1 ? "CASHIERSECRETKEY2222222222222222" : 
                                    i == 2 ? "AGENTSECRETKEY222222222222222222" : 
                                    i == 3 ? "MANAGERSECRETKEY2222222222222222" :
                                    OtpNet.Base32Encoding.ToString(OtpNet.KeyGeneration.GenerateRandomKey(20))
                };
                await userManager.CreateAsync(staffUser, "Staff123!");
                await userManager.AddToRoleAsync(staffUser, rolesToAssign[i].Name!);
                staffUsers.Add(staffUser);

                // Add to global lookup
                var staffEmailLower = staffUser.Email!.ToLower();
                var staffLookup = await context.UserTenants.FirstOrDefaultAsync(ut => ut.Email == staffEmailLower);
                if (staffLookup == null)
                {
                    context.UserTenants.Add(new UserTenant 
                    { 
                        Email = staffEmailLower, 
                        TenantId = tenantId,
                        TotpSecretKey = staffUser.TotpSecretKey
                    });
                }
                else
                {
                    staffLookup.TenantId = tenantId;
                    staffLookup.TotpSecretKey = staffUser.TotpSecretKey;
                }
            }
            await context.SaveChangesAsync();

            // 6. Categories & Items
            var categories = categoryData.Select(c => new MenuCategory { Name = c.Name, Icon = c.Icon, ImageUrl = c.ImageUrl, TenantId = tenantId }).ToList();
            context.MenuCategories.AddRange(categories);
            await context.SaveChangesAsync();

            var random = new Random();
            var items = new List<MenuItem>();
            foreach (var cat in categories)
            {
                for (int i = 1; i <= 5; i++)
                {
                    items.Add(new MenuItem 
                    { 
                        Name = $"{cat.Name} {i}", 
                        CategoryId = cat.Id, 
                        Price = random.Next(15, 120), 
                        TenantId = tenantId,
                        Description = "تجربة طعم لا تُنسى معدّة بأجود المكونات الطازجة.",
                        ImageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                    });
                }
            }
            context.MenuItems.AddRange(items);
            await context.SaveChangesAsync();

            // 7. Customers
            var customers = new List<Customer>
            {
                new() { Id = Guid.NewGuid(), Name = "عبدالله الشهري", PhoneNumber = "0500000001", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "ريما الفهد", PhoneNumber = "0500000002", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "محمد الدوسري", PhoneNumber = "0500000003", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "هيا العيسى", PhoneNumber = "0500000004", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "سعود الحربي", PhoneNumber = "0500000005", TenantId = tenantId },
                new() { Id = Guid.NewGuid(), Name = "لمى الخالدي", PhoneNumber = "0500000006", TenantId = tenantId }
            };
            context.Customers.AddRange(customers);
            await context.SaveChangesAsync();

            // 8. Orders
            var orders = new List<Order>();
            var statuses = new[] { "Completed", "Preparing", "Pending", "Cancelled" };
            var types = new[] { "DineIn", "Delivery", "Takeaway" };

            for (int i = 0; i < 100; i++)
            {
                var branch = branches[random.Next(branches.Count)];
                var customer = customers[random.Next(customers.Count)];
                
                orders.Add(new Order
                {
                    OrderNumber = $"#{1000 + i}",
                    CustomerName = customer.Name,
                    CustomerId = customer.Id,
                    BranchId = branch.Id,
                    TenantId = tenantId,
                    TotalAmount = random.Next(20, 600),
                    Status = statuses[random.Next(statuses.Length)],
                    OrderType = types[random.Next(types.Length)],
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 30)).AddHours(-random.Next(0, 24)),
                    ItemsSummary = "طلب متنوع من قائمة الطعام",
                    StaffId = staffUsers[random.Next(staffUsers.Count)].Id
                });
            }
            context.Orders.AddRange(orders);
            await context.SaveChangesAsync();
        }
    }
}
