using System;

namespace FoodRMS.Api.DTOs.Orders
{
    public class OrderAuditResponse
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Changes { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
