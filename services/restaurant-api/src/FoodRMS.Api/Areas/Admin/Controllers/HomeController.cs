using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodRMS.Api.Data;
using FoodRMS.Api.Areas.Admin.Models;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class HomeController : Controller
    {
        private readonly FoodRMSDbContext _context;

        public HomeController(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var tenants = await _context.Tenants.Include(t => t.Plan).ToListAsync();
            var tickets = await _context.SupportTickets.ToListAsync();
            var plans = await _context.Plans.ToListAsync();

            var model = new DashboardViewModel
            {
                TotalTenants = tenants.Count,
                ActiveTenants = tenants.Count(t => t.IsActive),
                TotalPlans = plans.Count,
                OpenSupportTickets = tickets.Count(t => t.Status == "Open"),
                TotalBranches = tenants.Count * 2, // Mock estimation or we could query cross-schema
                TotalEstimatedRevenue = tenants.Sum(t => t.Plan?.Price ?? 0),

                RecentTenants = tenants.OrderByDescending(t => t.CreatedAt).Take(5).Select(t => new RecentTenant
                {
                    Name = t.Name,
                    Plan = t.Plan?.Name ?? "N/A",
                    Date = t.CreatedAt.ToString("MMM dd"),
                    Status = t.IsActive ? "Active" : "Inactive"
                }).ToList(),

                PlanDistribution = tenants
                    .GroupBy(t => t.Plan?.Name ?? "No Plan")
                    .Select(g => new PlanUsage { PlanName = g.Key, Count = g.Count() })
                    .ToList()
            };

            // Mock some growth stats for visual impact
            model.TenantGrowth = new List<MonthlyStat>
            {
                new MonthlyStat { Label = "Jan", Value = 12 },
                new MonthlyStat { Label = "Feb", Value = 18 },
                new MonthlyStat { Label = "Mar", Value = 25 },
                new MonthlyStat { Label = "Apr", Value = 32 },
                new MonthlyStat { Label = "May", Value = tenants.Count }
            };

            return View(model);
        }
    }
}