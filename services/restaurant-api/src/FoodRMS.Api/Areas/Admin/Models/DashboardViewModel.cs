using System.Collections.Generic;

namespace FoodRMS.Api.Areas.Admin.Models
{
    public class DashboardViewModel
    {
        public int TotalTenants { get; set; }
        public int ActiveTenants { get; set; }
        public int TotalPlans { get; set; }
        public int OpenSupportTickets { get; set; }
        public int TotalBranches { get; set; }
        public decimal TotalEstimatedRevenue { get; set; }

        public List<MonthlyStat> TenantGrowth { get; set; } = new List<MonthlyStat>();
        public List<PlanUsage> PlanDistribution { get; set; } = new List<PlanUsage>();
        public List<RecentTenant> RecentTenants { get; set; } = new List<RecentTenant>();
    }

    public class MonthlyStat
    {
        public string Label { get; set; }
        public int Value { get; set; }
    }

    public class PlanUsage
    {
        public string PlanName { get; set; }
        public int Count { get; set; }
    }

    public class RecentTenant
    {
        public string Name { get; set; }
        public string Plan { get; set; }
        public string Date { get; set; }
        public string Status { get; set; }
    }
}
