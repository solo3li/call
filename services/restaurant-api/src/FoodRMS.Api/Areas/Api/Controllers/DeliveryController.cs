using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Customers;
using FoodRMS.Api.DTOs.Delivery;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DeliveryController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        // ── Zones ─────────────────────────────────────────────────────────────

        [HttpGet("zones")]
        public async Task<ActionResult<List<DeliveryZoneDto>>> GetZones([FromQuery] Guid? branchId)
        {
            return await _deliveryService.GetZonesAsync(branchId);
        }

        [HttpPost("zones")]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<DeliveryZoneDto>> CreateZone([FromBody] DeliveryZoneDto dto)
        {
            var result = await _deliveryService.CreateZoneAsync(dto);
            return Ok(result);
        }

        [HttpDelete("zones/{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> DeleteZone(int id)
        {
            var success = await _deliveryService.DeleteZoneAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // ── Customer Addresses ────────────────────────────────────────────────

        [HttpPost("customers/{customerId}/addresses")]
        public async Task<ActionResult<CustomerAddressDto>> AddAddress(Guid customerId, [FromBody] CustomerAddressDto dto)
        {
            var result = await _deliveryService.AddCustomerAddressAsync(customerId, dto);
            return Ok(result);
        }

        [HttpDelete("customers/addresses/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var success = await _deliveryService.DeleteCustomerAddressAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // ── Smart Routing ─────────────────────────────────────────────────────

        /// <summary>
        /// Returns AI-suggested groups of nearby pending delivery orders.
        /// Uses Haversine distance clustering (no external APIs needed).
        /// </summary>
        [HttpGet("suggest-groups")]
        public async Task<ActionResult<List<SuggestedGroupDto>>> SuggestGroups([FromQuery] Guid? branchId)
        {
            var result = await _deliveryService.SuggestDeliveryGroupsAsync(branchId);
            return Ok(result);
        }

        /// <summary>Creates a delivery trip: assigns a group of orders to one driver</summary>
        [HttpPost("trips")]
        public async Task<ActionResult<DeliveryTripDto>> CreateTrip([FromBody] CreateTripRequest request)
        {
            try
            {
                var result = await _deliveryService.CreateTripAsync(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Returns all active delivery trips for this tenant</summary>
        [HttpGet("trips")]
        public async Task<ActionResult<List<DeliveryTripDto>>> GetTrips([FromQuery] Guid? branchId)
        {
            var result = await _deliveryService.GetTripsAsync(branchId);
            return Ok(result);
        }

        /// <summary>Returns a Google Maps multi-stop URL for a trip (for the driver)</summary>
        [HttpGet("trips/{id}/maps-url")]
        public async Task<ActionResult<object>> GetTripMapsUrl(Guid id)
        {
            var url = await _deliveryService.GetTripMapsUrlAsync(id);
            if (url == null) return NotFound(new { message = "الرحلة غير موجودة أو لا توجد عناوين" });
            return Ok(new { url });
        }

        /// <summary>Updates the status of a delivery trip (Pending → InProgress → Completed)</summary>
        [HttpPut("trips/{id}/status")]
        public async Task<ActionResult<DeliveryTripDto>> UpdateTripStatus(Guid id, [FromBody] UpdateTripStatusRequest request)
        {
            var result = await _deliveryService.UpdateTripStatusAsync(id, request.Status);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}
