using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Delivery
{
    /// <summary>A single order inside a suggested group</summary>
    public class SuggestedOrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerAddress { get; set; }
        public string? CustomerPhone { get; set; }
        public string? ItemsSummary { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>AI-suggested group of nearby delivery orders</summary>
    public class SuggestedGroupDto
    {
        public int GroupIndex { get; set; }
        public string Label { get; set; } = string.Empty;
        public double? AvgLatitude { get; set; }
        public double? AvgLongitude { get; set; }

        /// <summary>Average distance between orders in km</summary>
        public double AvgDistanceKm { get; set; }

        /// <summary>Whether this group has GPS coordinates (vs text-only addresses)</summary>
        public bool HasCoordinates { get; set; }

        public List<SuggestedOrderDto> Orders { get; set; } = new();
    }

    /// <summary>Request to create a new delivery trip from a group of orders</summary>
    public class CreateTripRequest
    {
        public string DriverName { get; set; } = string.Empty;
        public string DriverPhone { get; set; } = string.Empty;
        public List<string> OrderIds { get; set; } = new();
        public Guid? BranchId { get; set; }
    }

    /// <summary>Delivery trip response DTO</summary>
    public class DeliveryTripDto
    {
        public string Id { get; set; } = string.Empty;
        public string TripNumber { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public string DriverPhone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? BranchId { get; set; }
        public List<SuggestedOrderDto> Orders { get; set; } = new();

        /// <summary>Pre-built Google Maps multi-stop URL</summary>
        public string? MapsUrl { get; set; }
    }

    public class UpdateTripStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
