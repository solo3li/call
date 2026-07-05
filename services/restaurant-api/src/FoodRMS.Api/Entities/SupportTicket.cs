using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Entities
{
    public class SupportTicket
    {
        public Guid Id { get; set; }
        public Guid? TenantId { get; set; } // Null if it's a general/public inquiry
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "Open"; // Open, Closed
        public long? TelegramChatId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public bool IsComplaint { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Tenant? Tenant { get; set; }
        public ICollection<SupportMessage> Messages { get; set; } = new List<SupportMessage>();
    }
}