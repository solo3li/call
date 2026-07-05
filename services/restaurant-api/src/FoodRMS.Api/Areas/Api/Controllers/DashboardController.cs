using FoodRMS.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public DashboardController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats([FromQuery] Guid? branchId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var last7Days = now.AddDays(-6).Date;

            var orderQuery = _context.Orders.AsQueryable();
            if (branchId.HasValue)
            {
                orderQuery = orderQuery.Where(o => o.BranchId == branchId.Value);
            }

            var totalOrders = await orderQuery.CountAsync();
            var totalRevenue = await orderQuery.Where(o => o.Status == "Completed").SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var pendingOrders = await orderQuery.CountAsync(o => o.Status == "Pending");
            var preparingOrders = await orderQuery.CountAsync(o => o.Status == "Preparing");
            var completedToday = await orderQuery.CountAsync(o => o.Status == "Completed" && o.CreatedAt.Date == today);

            // Calculate Daily Revenue for last 7 days
            var ordersInLast7Days = await orderQuery
                .Where(o => o.CreatedAt >= last7Days && o.Status == "Completed")
                .ToListAsync();

            var revenueData = Enumerable.Range(0, 7)
                .Select(i => last7Days.AddDays(i))
                .Select(date => new RevenuePoint
                {
                    Name = date.ToString("ddd", new CultureInfo("ar-SA")),
                    Revenue = ordersInLast7Days.Where(o => o.CreatedAt.Date == date).Sum(o => o.TotalAmount),
                    Expenses = ordersInLast7Days.Where(o => o.CreatedAt.Date == date).Sum(o => o.TotalAmount) * 0.4m // Mocking expenses as 40%
                })
                .ToList();

            // Calculate Hourly Orders for today
            var ordersToday = ordersInLast7Days.Where(o => o.CreatedAt.Date == today).ToList();
            var ordersPerHour = Enumerable.Range(8, 15) // From 8 AM to 10 PM
                .Select(hour => new HourlyOrders
                {
                    Hour = hour > 12 ? $"{hour - 12}م" : $"{hour}ص",
                    Orders = ordersToday.Count(o => o.CreatedAt.Hour == hour)
                })
                .ToList();

            // Calculate Top Items
            var topItems = await _context.OrderItems
                .Include(oi => oi.MenuItem)
                .Where(oi => (branchId == null || oi.Order.BranchId == branchId) && oi.Order.Status == "Completed")
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem.Name })
                .Select(g => new TopItemDto
                {
                    Id = g.Key.MenuItemId,
                    Name = g.Key.Name,
                    Orders = g.Count(),
                    Revenue = g.Sum(oi => oi.Price * oi.Quantity),
                    Emoji = "🍔", // Could be mapped from category
                    Trend = "+15%" // Mock trend
                })
                .OrderByDescending(x => x.Orders)
                .Take(5)
                .ToListAsync();

            // Calculate Top Branches
            var topBranches = await _context.Branches
                .Select(b => new TopBranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Orders = b.Orders.Count(o => o.Status == "Completed"),
                    Revenue = b.Orders.Where(o => o.Status == "Completed").Sum(o => (decimal?)o.TotalAmount) ?? 0,
                    Trend = "+5%" // Mock trend
                })
                .OrderByDescending(x => x.Revenue)
                .ThenByDescending(x => x.Orders)
                .Take(5)
                .ToListAsync();

            return Ok(new DashboardStatsDto
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                ActiveTables = 5, // Mock
                PendingOrders = pendingOrders,
                PreparingOrders = preparingOrders,
                InKitchenOrders = preparingOrders / 2, // Mock breakdown
                DeliveryOrders = preparingOrders / 4, // Mock breakdown
                CompletedTodayOrders = completedToday,
                RevenueData = revenueData,
                OrdersPerHour = ordersPerHour,
                WeeklyRatings = await GetRealWeeklyRatings(branchId),
                TopItems = topItems,
                TopBranches = topBranches,
                Notifications = await GetRealNotifications(branchId)
            });
        }

        private async Task<List<NotificationDto>> GetRealNotifications(Guid? branchId)
        {
            var recentOrders = await _context.Orders
                .Where(o => branchId == null || o.BranchId == branchId)
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .ToListAsync();

            var notifications = recentOrders.Select((o, i) => new NotificationDto
            {
                Id = i + 1,
                Text = $"طلب جديد #{o.OrderNumber} بقيمة {o.TotalAmount} ر.س",
                Time = GetTimeAgo(o.CreatedAt),
                Type = "order",
                Unread = o.CreatedAt > DateTime.UtcNow.AddMinutes(-30)
            }).ToList();

            if (!notifications.Any())
            {
                notifications.Add(new NotificationDto
                {
                    Id = 1,
                    Text = "مرحباً بك في أوبنو! ابدأ بإضافة فروعك ومنتجاتك.",
                    Time = "الآن",
                    Type = "success",
                    Unread = true
                });
            }

            return notifications;
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var span = DateTime.UtcNow - dateTime;
            if (span.TotalMinutes < 60) return $"منذ {(int)span.TotalMinutes} دقيقة";
            if (span.TotalHours < 24) return $"منذ {(int)span.TotalHours} ساعة";
            return dateTime.ToString("yyyy-MM-dd");
        }

        private async Task<List<DailyRating>> GetRealWeeklyRatings(Guid? branchId)
        {
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
            
            var query = _context.Orders
                .Where(o => o.Rating.HasValue && o.CreatedAt >= sevenDaysAgo);

            if (branchId.HasValue)
            {
                query = query.Where(o => o.BranchId == branchId);
            }

            var ratings = await query
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    AverageRating = g.Average(o => (double)o.Rating.Value)
                })
                .ToListAsync();

            var dailyRatings = new List<DailyRating>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.Date.AddDays(-i);
                var ratingForDay = ratings.FirstOrDefault(r => r.Date == date);
                
                dailyRatings.Add(new DailyRating
                {
                    Day = date.ToString("dddd", new System.Globalization.CultureInfo("ar-EG")),
                    Rating = ratingForDay != null ? Math.Round(ratingForDay.AverageRating, 1) : 0
                });
            }
            return dailyRatings;
        }
    }
}
