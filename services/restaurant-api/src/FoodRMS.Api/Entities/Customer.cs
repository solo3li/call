using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class Customer : ITenantEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Addresses { get; set; } = string.Empty; // Store as JSON or semicolon separated string for SQLite
        
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public long? TelegramChatId { get; set; }
        public string SavedFavorites { get; set; } = string.Empty;
        public string CustomerPreferences { get; set; } = string.Empty;

        public ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
