using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class BusinessDay : ITenantEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }
        
        public Guid? StartedByUserId { get; set; }
        public User? StartedByUser { get; set; }
        
        public Guid? EndedByUserId { get; set; }
        public User? EndedByUser { get; set; }

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
