using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class CustomerAddress : ITenantEntity
    {
        public int Id { get; set; }
        public string AddressDetails { get; set; } = string.Empty;
        
        /// <summary>Latitude coordinate (optional — use when address is a GPS location)</summary>
        public double? Latitude { get; set; }
        
        /// <summary>Longitude coordinate (optional — use when address is a GPS location)</summary>
        public double? Longitude { get; set; }
        
        public int? DeliveryZoneId { get; set; }
        public DeliveryZone? DeliveryZone { get; set; }

        public Guid CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
