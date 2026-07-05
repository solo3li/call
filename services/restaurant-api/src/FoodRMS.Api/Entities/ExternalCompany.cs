using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class ExternalCompany : ITenantEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid TenantId { get; set; }
    }
}
