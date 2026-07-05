using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Entities
{
    public class Tenant
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty; // UUID format
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        public Guid? PlanId { get; set; }
        public Plan? Plan { get; set; }

        public Guid? CurrencyId { get; set; }
        public Currency? Currency { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();

        public string TelegramBotToken { get; set; } = string.Empty;
        public string TelegramBotUsername { get; set; } = string.Empty;
        public string TelegramBotStatus { get; set; } = "Inactive"; // Inactive, Active, Error
        public long TelegramBotLastUpdateId { get; set; }

        public bool AutoPrintExternalOrders { get; set; } = false;
    }
}
