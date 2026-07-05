using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class OrderAudit : ITenantEntity
    {
        public int Id { get; set; }
        
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;
        
        public Guid? UserId { get; set; }
        public User? User { get; set; }
        
        public string UserName { get; set; } = string.Empty; // Store name for cases where user is deleted
        
        public string Action { get; set; } = string.Empty; // Create, UpdateStatus, EditDetails
        
        public string Changes { get; set; } = string.Empty; // JSON or text detailing the changes
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
