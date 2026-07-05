using System;

namespace FoodRMS.Api.DTOs.Customers
{
    public class CustomerAddressDto
    {
        public int Id { get; set; }
        public string AddressDetails { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int? DeliveryZoneId { get; set; }
        public string? DeliveryZoneName { get; set; }
        public decimal? DeliveryCost { get; set; }
    }

    public class DeliveryZoneDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal DeliveryCost { get; set; }
        public Guid BranchId { get; set; }
        
        /// <summary>
        /// JSON string of polygon coordinates: "[[lat,lng],[lat,lng],...]"
        /// </summary>
        public string? Coordinates { get; set; }
    }
}
