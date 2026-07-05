using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class MenuCategory : ITenantEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; }

        public ICollection<MenuItem> Items { get; set; } = new List<MenuItem>();
    }
}
