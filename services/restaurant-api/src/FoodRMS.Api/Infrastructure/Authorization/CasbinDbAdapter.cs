using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Casbin;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FoodRMS.Api.Infrastructure.Authorization
{
    /// <summary>
    /// Loads Casbin policies from public.CasbinRules into the enforcer.
    /// Called at startup and can be called again to refresh policies.
    /// Avoids implementing IReadOnlyAdapter to keep things simple and reliable.
    /// </summary>
    public static class CasbinPolicyLoader
    {
        public static async Task LoadPoliciesFromDbAsync(IEnforcer enforcer, IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();

            // Clear existing in-memory policies before reloading
            enforcer.ClearPolicy();

            var rules = await context.CasbinRules.AsNoTracking().ToListAsync();

            foreach (var rule in rules)
            {
                var values = new[] { rule.V0, rule.V1, rule.V2, rule.V3, rule.V4, rule.V5 }
                    .Where(v => !string.IsNullOrEmpty(v))
                    .Select(v => v!)
                    .ToList();

                if (values.Count == 0) continue;

                if (rule.PType == "p" && values.Count >= 4)
                {
                    // p, sub, dom, obj, act
                    enforcer.AddPolicy(values[0], values[1], values[2], values[3]);
                }
                else if (rule.PType == "g" && values.Count >= 3)
                {
                    // g, user, role, domain
                    enforcer.AddGroupingPolicy(values[0], values[1], values[2]);
                }
            }
        }
    }

    /// <summary>
    /// Default Casbin policies for all system roles.
    /// Stored in public.CasbinRules on first run.
    /// </summary>
    public static class CasbinPolicySeeder
    {
        private static readonly List<(string PType, string V0, string V1, string V2, string? V3)> GlobalRolePolicies = new()
        {
            // Owner — full access in any tenant (wildcard domain)
            ("p", "Owner", "*", "*", "*"),

            // Manager — full access to most resources in any tenant
            ("p", "Manager", "*", "orders",      "*"),
            ("p", "Manager", "*", "menu",         "*"),
            ("p", "Manager", "*", "branches",     "*"),
            ("p", "Manager", "*", "staff",        "*"),
            ("p", "Manager", "*", "employees",    "*"),
            ("p", "Manager", "*", "customers",    "*"),
            ("p", "Manager", "*", "delivery",     "*"),
            ("p", "Manager", "*", "roles",        "*"),
            ("p", "Manager", "*", "departments",  "*"),
            ("p", "Manager", "*", "dashboard",    "read"),
            ("p", "Manager", "*", "plans",        "read"),

            // Chief (kitchen head)
            ("p", "Chief",   "*", "orders", "read"),
            ("p", "Chief",   "*", "orders", "update"),
            ("p", "Chief",   "*", "menu",   "read"),

            // Barista
            ("p", "Barista", "*", "orders", "read"),
            ("p", "Barista", "*", "orders", "update"),
            ("p", "Barista", "*", "menu",   "read"),

            // Waiter
            ("p", "Waiter",  "*", "orders",    "read"),
            ("p", "Waiter",  "*", "orders",    "create"),
            ("p", "Waiter",  "*", "orders",    "update"),
            ("p", "Waiter",  "*", "menu",      "read"),
            ("p", "Waiter",  "*", "customers", "read"),

            // Cashier
            ("p", "Cashier", "*", "orders",    "*"),
            ("p", "Cashier", "*", "menu",      "read"),
            ("p", "Cashier", "*", "customers", "*"),
            ("p", "Cashier", "*", "dashboard", "read"),
        };

        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<FoodRMSDbContext>>();

            foreach (var (ptype, v0, v1, v2, v3) in GlobalRolePolicies)
            {
                bool exists = await context.CasbinRules.AnyAsync(r =>
                    r.PType == ptype && r.V0 == v0 && r.V1 == v1 && r.V2 == v2 && r.V3 == v3);

                if (!exists)
                {
                    context.CasbinRules.Add(new CasbinRule
                    {
                        PType = ptype,
                        V0 = v0,
                        V1 = v1,
                        V2 = v2,
                        V3 = v3
                    });
                }
            }

            await context.SaveChangesAsync();
            logger.LogInformation("Casbin policies seeded.");
        }

        /// <summary>
        /// Assigns a user to a role within a specific tenant in both the DB and the live enforcer.
        /// </summary>
        public static async Task AssignUserRoleAsync(
            FoodRMSDbContext context,
            IEnforcer enforcer,
            string userId,
            string role,
            string tenantId)
        {
            bool exists = await context.CasbinRules.AnyAsync(r =>
                r.PType == "g" && r.V0 == userId && r.V1 == role && r.V2 == tenantId);

            if (!exists)
            {
                context.CasbinRules.Add(new CasbinRule
                {
                    PType = "g",
                    V0 = userId,
                    V1 = role,
                    V2 = tenantId
                });
                await context.SaveChangesAsync();

                // Also update the live in-memory enforcer
                enforcer.AddGroupingPolicy(userId, role, tenantId);
            }
        }
    }
}
