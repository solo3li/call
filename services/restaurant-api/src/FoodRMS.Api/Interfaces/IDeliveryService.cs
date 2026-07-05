using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Customers;
using FoodRMS.Api.DTOs.Delivery;

namespace FoodRMS.Api.Interfaces
{
    public interface IDeliveryService
    {
        // ── Zones ────────────────────────────────────────────
        Task<List<DeliveryZoneDto>> GetZonesAsync(Guid? branchId = null);
        Task<DeliveryZoneDto> CreateZoneAsync(DeliveryZoneDto dto);
        Task<bool> DeleteZoneAsync(int id);

        // ── Customer addresses ────────────────────────────────
        Task<CustomerAddressDto> AddCustomerAddressAsync(Guid customerId, CustomerAddressDto dto);
        Task<bool> DeleteCustomerAddressAsync(int id);

        // ── Smart Routing ─────────────────────────────────────
        /// <summary>Returns AI-suggested groups of nearby pending delivery orders</summary>
        Task<List<SuggestedGroupDto>> SuggestDeliveryGroupsAsync(Guid? branchId = null);

        /// <summary>Creates a delivery trip from a set of order IDs assigned to one driver</summary>
        Task<DeliveryTripDto> CreateTripAsync(CreateTripRequest request);

        /// <summary>Returns all active trips for the current tenant</summary>
        Task<List<DeliveryTripDto>> GetTripsAsync(Guid? branchId = null);

        /// <summary>Returns a pre-built Google Maps multi-stop URL for a trip</summary>
        Task<string?> GetTripMapsUrlAsync(Guid tripId);

        /// <summary>Updates the status of a trip (Pending → InProgress → Completed)</summary>
        Task<DeliveryTripDto?> UpdateTripStatusAsync(Guid tripId, string status);
    }
}
