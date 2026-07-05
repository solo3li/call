using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class DeliveryZone : ITenantEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal DeliveryCost { get; set; }
        
        /// <summary>
        /// JSON array of [lat, lng] coordinate pairs defining the zone polygon.
        /// Example: "[[24.7136,46.6753],[24.72,46.68],[24.71,46.69]]"
        /// </summary>
        public string? Coordinates { get; set; }
        
        public Guid BranchId { get; set; }
        public Branch Branch { get; set; } = null!;

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
