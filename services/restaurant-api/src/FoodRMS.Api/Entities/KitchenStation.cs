using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class KitchenStation : ITenantEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public Guid? BranchId { get; set; }
        public Branch? Branch { get; set; }
        
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
