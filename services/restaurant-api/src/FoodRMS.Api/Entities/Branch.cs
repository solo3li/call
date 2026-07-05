using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class Branch : ITenantEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = "Open"; // Open, Closed
        public double Rating { get; set; }
        
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
