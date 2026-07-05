using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveTables { get; set; }
        public int PendingOrders { get; set; }
        public int PreparingOrders { get; set; }
        public int InKitchenOrders { get; set; }
        public int DeliveryOrders { get; set; }
        public int CompletedTodayOrders { get; set; }
        
        public List<RevenuePoint> RevenueData { get; set; } = new();
        public List<HourlyOrders> OrdersPerHour { get; set; } = new();
        public List<DailyRating> WeeklyRatings { get; set; } = new();
        public List<TopItemDto> TopItems { get; set; } = new();
        public List<TopBranchDto> TopBranches { get; set; } = new();
        public List<NotificationDto> Notifications { get; set; } = new();
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Type { get; set; } = "info"; // order, warning, review, success, info
        public bool Unread { get; set; }
    }

    public class TopItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Emoji { get; set; } = "🍔";
        public int Orders { get; set; }
        public decimal Revenue { get; set; }
        public string Trend { get; set; } = "+0%";
    }

    public class TopBranchDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Orders { get; set; }
        public decimal Revenue { get; set; }
        public string Trend { get; set; } = "+0%";
    }

    public class RevenuePoint
    {
        public string Name { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
    }

    public class HourlyOrders
    {
        public string Hour { get; set; } = string.Empty;
        public int Orders { get; set; }
    }

    public class DailyRating
    {
        public string Day { get; set; } = string.Empty;
        public double Rating { get; set; }
    }
}
