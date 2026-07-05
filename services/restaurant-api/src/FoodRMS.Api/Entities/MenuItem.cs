using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class MenuItem : ITenantEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public MenuCategory Category { get; set; }
        public Guid? BranchId { get; set; }
        public Branch? Branch { get; set; }
        public int? KitchenStationId { get; set; }
        public KitchenStation? KitchenStation { get; set; }
        public bool IsAvailable { get; set; } = true;
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; }
    }
}
