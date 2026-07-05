using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Customers;
using FoodRMS.Api.DTOs.Delivery;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class DeliveryService : IDeliveryService
    {
        private readonly FoodRMSDbContext _context;

        // Maximum radius (km) to cluster orders into the same group
        private const double ClusterRadiusKm = 3.5;

        public DeliveryService(FoodRMSDbContext context)
        {
            _context = context;
        }

        // ── Zones ────────────────────────────────────────────────────────────

        public async Task<List<DeliveryZoneDto>> GetZonesAsync(Guid? branchId = null)
        {
            var query = _context.DeliveryZones.AsQueryable();
            if (branchId.HasValue)
                query = query.Where(z => z.BranchId == branchId.Value);

            return await query.Select(z => new DeliveryZoneDto
            {
                Id = z.Id,
                Name = z.Name,
                DeliveryCost = z.DeliveryCost,
                BranchId = z.BranchId,
                Coordinates = z.Coordinates
            }).ToListAsync();
        }

        public async Task<DeliveryZoneDto> CreateZoneAsync(DeliveryZoneDto dto)
        {
            var zone = new DeliveryZone
            {
                Name = dto.Name,
                DeliveryCost = dto.DeliveryCost,
                BranchId = dto.BranchId,
                Coordinates = dto.Coordinates
            };
            _context.DeliveryZones.Add(zone);
            await _context.SaveChangesAsync();
            dto.Id = zone.Id;
            return dto;
        }

        public async Task<bool> DeleteZoneAsync(int id)
        {
            var zone = await _context.DeliveryZones.FindAsync(id);
            if (zone == null) return false;
            _context.DeliveryZones.Remove(zone);
            await _context.SaveChangesAsync();
            return true;
        }

        // ── Customer Addresses ───────────────────────────────────────────────

        public async Task<CustomerAddressDto> AddCustomerAddressAsync(Guid customerId, CustomerAddressDto dto)
        {
            var address = new CustomerAddress
            {
                CustomerId = customerId,
                AddressDetails = dto.AddressDetails,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                DeliveryZoneId = dto.DeliveryZoneId
            };
            _context.CustomerAddresses.Add(address);
            await _context.SaveChangesAsync();

            var zone = dto.DeliveryZoneId.HasValue
                ? await _context.DeliveryZones.FindAsync(dto.DeliveryZoneId.Value)
                : null;

            return new CustomerAddressDto
            {
                Id = address.Id,
                AddressDetails = address.AddressDetails,
                Latitude = address.Latitude,
                Longitude = address.Longitude,
                DeliveryZoneId = address.DeliveryZoneId,
                DeliveryZoneName = zone?.Name,
                DeliveryCost = zone?.DeliveryCost
            };
        }

        public async Task<bool> DeleteCustomerAddressAsync(int id)
        {
            var address = await _context.CustomerAddresses.FindAsync(id);
            if (address == null) return false;
            _context.CustomerAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return true;
        }

        // ── Smart Routing ────────────────────────────────────────────────────

        public async Task<List<SuggestedGroupDto>> SuggestDeliveryGroupsAsync(Guid? branchId = null)
        {
            // Load pending delivery orders (not yet in a trip, or trip not started)
            var query = _context.Orders
                .Include(o => o.CustomerAddress)
                .Include(o => o.Customer)
                .Where(o =>
                    (o.OrderType == "Delivery" || o.OrderType == "توصيل") &&
                    o.Status != "Completed" && o.Status != "مكتمل" &&
                    o.Status != "Cancelled" && o.Status != "ملغي" &&
                    o.ExternalCompanyId == null &&
                    o.DeliveryTripId == null);

            if (branchId.HasValue)
                query = query.Where(o => o.BranchId == branchId.Value);

            var orders = await query.ToListAsync();

            if (!orders.Any())
                return new List<SuggestedGroupDto>();

            // Build flat list of order info with resolved coordinates
            var orderInfos = orders.Select(o =>
            {
                // Try to get lat/lng from the order's linked CustomerAddress first, then from order fields
                double? lat = o.CustomerAddress?.Latitude;
                double? lng = o.CustomerAddress?.Longitude;

                // Fallback: try to parse customerAddress text as "lat,lng"
                if (lat == null && !string.IsNullOrEmpty(o.CustomerAddress?.AddressDetails))
                {
                    var parts = o.CustomerAddress.AddressDetails.Split(',');
                    if (parts.Length == 2 &&
                        double.TryParse(parts[0].Trim(), out var pLat) &&
                        double.TryParse(parts[1].Trim(), out var pLng))
                    {
                        lat = pLat;
                        lng = pLng;
                    }
                }

                return new
                {
                    Order = o,
                    Lat = lat,
                    Lng = lng,
                    Address = o.CustomerAddress?.AddressDetails
                };
            }).ToList();

            // Separate orders with GPS coordinates from text-only ones
            var withCoords = orderInfos.Where(x => x.Lat.HasValue && x.Lng.HasValue).ToList();
            var withoutCoords = orderInfos.Where(x => !x.Lat.HasValue || !x.Lng.HasValue).ToList();

            var groups = new List<SuggestedGroupDto>();
            int groupIdx = 0;

            // ── Greedy Haversine Clustering ──────────────────────────────────
            // Nearest-neighbor greedy: pick first unassigned → grow cluster while radius fits
            var unassigned = withCoords.ToList();
            while (unassigned.Any())
            {
                var seed = unassigned.First();
                unassigned.RemoveAt(0);

                var clusterItems = new List<(double Lat, double Lng, Order Order, string? Address)>
                {
                    (seed.Lat!.Value, seed.Lng!.Value, seed.Order, seed.Address)
                };

                // Try to absorb nearby unassigned orders
                bool found = true;
                while (found && unassigned.Any())
                {
                    found = false;
                    // Recompute centroid
                    double cLat = clusterItems.Average(x => x.Lat);
                    double cLng = clusterItems.Average(x => x.Lng);

                    // Find closest unassigned within radius
                    var nearest = unassigned
                        .Select(x => (Item: x, Dist: Haversine(cLat, cLng, x.Lat!.Value, x.Lng!.Value)))
                        .Where(x => x.Dist <= ClusterRadiusKm)
                        .OrderBy(x => x.Dist)
                        .FirstOrDefault();

                    if (nearest.Item != null)
                    {
                        clusterItems.Add((nearest.Item.Lat!.Value, nearest.Item.Lng!.Value,
                            nearest.Item.Order, nearest.Item.Address));
                        unassigned.Remove(nearest.Item);
                        found = true;
                    }
                }

                // Sort cluster by nearest-neighbor chain (greedy TSP approximation)
                var sorted = SortByNearestNeighbor(clusterItems);

                double avgLat = sorted.Average(x => x.Lat);
                double avgLng = sorted.Average(x => x.Lng);

                double avgDist = sorted.Count > 1
                    ? ComputeAvgPairwiseDistance(sorted)
                    : 0;

                groups.Add(new SuggestedGroupDto
                {
                    GroupIndex = groupIdx++,
                    Label = $"المنطقة {GetArabicLetter(groupIdx)}",
                    AvgLatitude = avgLat,
                    AvgLongitude = avgLng,
                    AvgDistanceKm = Math.Round(avgDist, 2),
                    HasCoordinates = true,
                    Orders = sorted.Select(x => ToOrderDto(x.Order, x.Lat, x.Lng, x.Address)).ToList()
                });
            }

            // ── Text-address-only group ──────────────────────────────────────
            if (withoutCoords.Any())
            {
                groups.Add(new SuggestedGroupDto
                {
                    GroupIndex = groupIdx++,
                    Label = "عناوين نصية (بدون إحداثيات)",
                    HasCoordinates = false,
                    AvgDistanceKm = 0,
                    Orders = withoutCoords.Select(x => ToOrderDto(x.Order, null, null, x.Address)).ToList()
                });
            }

            return groups;
        }

        public async Task<DeliveryTripDto> CreateTripAsync(CreateTripRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.DriverName))
                throw new InvalidOperationException("يجب تحديد اسم المندوب.");
            if (!request.OrderIds.Any())
                throw new InvalidOperationException("يجب تحديد طلب واحد على الأقل.");

            // Determine trip number
            var tripCount = await _context.DeliveryTrips.CountAsync();
            var tripNumber = $"T{(tripCount + 1):D4}";

            var trip = new DeliveryTrip
            {
                TripNumber = tripNumber,
                DriverName = request.DriverName.Trim(),
                DriverPhone = request.DriverPhone?.Trim() ?? string.Empty,
                Status = "Pending",
                BranchId = request.BranchId,
                CreatedAt = DateTime.UtcNow
            };

            _context.DeliveryTrips.Add(trip);

            // Link orders to the trip and assign driver info on each order
            var orderGuids = request.OrderIds
                .Select(id => Guid.TryParse(id, out var g) ? g : Guid.Empty)
                .Where(g => g != Guid.Empty)
                .ToList();

            var orders = await _context.Orders
                .Include(o => o.CustomerAddress)
                .Include(o => o.Customer)
                .Where(o => orderGuids.Contains(o.Id))
                .ToListAsync();

            foreach (var order in orders)
            {
                order.DeliveryTrip = trip;
                order.DriverName = request.DriverName.Trim();
                order.DriverPhone = request.DriverPhone?.Trim() ?? string.Empty;
                if (order.Status == "Pending" || order.Status == "Preparing" || order.Status == "Ready")
                    order.Status = "Delivering";
            }

            await _context.SaveChangesAsync();

            return MapTripToDto(trip, orders);
        }

        public async Task<List<DeliveryTripDto>> GetTripsAsync(Guid? branchId = null)
        {
            var query = _context.DeliveryTrips
                .Include(t => t.Orders)
                    .ThenInclude(o => o.CustomerAddress)
                .Include(t => t.Orders)
                    .ThenInclude(o => o.Customer)
                .Where(t => t.Status != "Completed")
                .OrderByDescending(t => t.CreatedAt);

            if (branchId.HasValue)
                query = (IOrderedQueryable<DeliveryTrip>)query.Where(t => t.BranchId == branchId.Value);

            var trips = await query.ToListAsync();
            return trips.Select(t => MapTripToDto(t, t.Orders.ToList())).ToList();
        }

        public async Task<string?> GetTripMapsUrlAsync(Guid tripId)
        {
            var trip = await _context.DeliveryTrips
                .Include(t => t.Orders)
                    .ThenInclude(o => o.CustomerAddress)
                .Include(t => t.Orders)
                    .ThenInclude(o => o.Customer)
                .Include(t => t.Branch)
                .FirstOrDefaultAsync(t => t.Id == tripId);

            if (trip == null) return null;

            return BuildMapsUrl(trip);
        }

        public async Task<DeliveryTripDto?> UpdateTripStatusAsync(Guid tripId, string status)
        {
            var trip = await _context.DeliveryTrips
                .Include(t => t.Orders)
                    .ThenInclude(o => o.CustomerAddress)
                .Include(t => t.Orders)
                    .ThenInclude(o => o.Customer)
                .FirstOrDefaultAsync(t => t.Id == tripId);

            if (trip == null) return null;

            trip.Status = status;
            if (status == "Completed")
            {
                trip.CompletedAt = DateTime.UtcNow;
                foreach (var o in trip.Orders)
                    o.Status = "Completed";
            }

            await _context.SaveChangesAsync();
            return MapTripToDto(trip, trip.Orders.ToList());
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private static SuggestedOrderDto ToOrderDto(Order o, double? lat, double? lng, string? address)
        {
            return new SuggestedOrderDto
            {
                Id = o.Id.ToString(),
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                CustomerAddress = address,
                CustomerPhone = o.Customer?.PhoneNumber,
                ItemsSummary = o.ItemsSummary,
                Latitude = lat,
                Longitude = lng,
                TotalAmount = o.TotalAmount,
                Status = o.Status
            };
        }

        private static DeliveryTripDto MapTripToDto(DeliveryTrip trip, List<Order> orders)
        {
            var orderDtos = orders.Select(o => new SuggestedOrderDto
            {
                Id = o.Id.ToString(),
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                CustomerAddress = o.CustomerAddress?.AddressDetails,
                CustomerPhone = o.Customer?.PhoneNumber,
                ItemsSummary = o.ItemsSummary,
                Latitude = o.CustomerAddress?.Latitude,
                Longitude = o.CustomerAddress?.Longitude,
                TotalAmount = o.TotalAmount,
                Status = o.Status
            }).ToList();

            return new DeliveryTripDto
            {
                Id = trip.Id.ToString(),
                TripNumber = trip.TripNumber,
                DriverName = trip.DriverName,
                DriverPhone = trip.DriverPhone,
                Status = trip.Status,
                CreatedAt = trip.CreatedAt,
                CompletedAt = trip.CompletedAt,
                BranchId = trip.BranchId?.ToString(),
                Orders = orderDtos,
                MapsUrl = BuildMapsUrl(trip)
            };
        }

        /// <summary>
        /// Builds a Google Maps multi-stop directions URL (no API key needed).
        /// Format: https://www.google.com/maps/dir/ORIGIN/WP1/WP2/DESTINATION
        /// </summary>
        private static string? BuildMapsUrl(DeliveryTrip trip)
        {
            var withCoords = new List<(double Lat, double Lng, Order Order, string? Address)>();
            var textOnly = new List<string>();

            foreach (var o in trip.Orders)
            {
                if (o.CustomerAddress?.Latitude.HasValue == true && o.CustomerAddress?.Longitude.HasValue == true)
                {
                    withCoords.Add((o.CustomerAddress.Latitude.Value, o.CustomerAddress.Longitude.Value, o, o.CustomerAddress.AddressDetails));
                }
                else if (!string.IsNullOrEmpty(o.CustomerAddress?.AddressDetails))
                {
                    textOnly.Add(Uri.EscapeDataString(o.CustomerAddress.AddressDetails));
                }
            }

            var sortedCoords = SortByNearestNeighbor(withCoords);
            var waypoints = sortedCoords.Select(x => $"{x.Lat},{x.Lng}").ToList();
            waypoints.AddRange(textOnly);

            if (!waypoints.Any()) return null;

            // Google Maps Directions URL with up to 10 waypoints (Google's limit)
            var parts = waypoints.Take(10).ToList();
            var url = "https://www.google.com/maps/dir/" + string.Join("/", parts);
            return url;
        }

        /// <summary>Haversine formula — returns distance in kilometers between two GPS points</summary>
        private static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0; // Earth radius in km
            double dLat = (lat2 - lat1) * Math.PI / 180.0;
            double dLon = (lon2 - lon1) * Math.PI / 180.0;
            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        /// <summary>
        /// Greedy nearest-neighbor sort for a cluster.
        /// Returns the cluster sorted in a travel-efficient order (approximates TSP).
        /// </summary>
        private static List<(double Lat, double Lng, Order Order, string? Address)> SortByNearestNeighbor(
            List<(double Lat, double Lng, Order Order, string? Address)> items)
        {
            if (items.Count <= 1) return items;

            var sorted = new List<(double Lat, double Lng, Order Order, string? Address)>();
            var remaining = items.ToList();

            // Start from the point closest to the group centroid
            double cLat = items.Average(x => x.Lat);
            double cLng = items.Average(x => x.Lng);
            var first = remaining.OrderBy(x => Haversine(cLat, cLng, x.Lat, x.Lng)).First();
            sorted.Add(first);
            remaining.Remove(first);

            while (remaining.Any())
            {
                var last = sorted.Last();
                var next = remaining.OrderBy(x => Haversine(last.Lat, last.Lng, x.Lat, x.Lng)).First();
                sorted.Add(next);
                remaining.Remove(next);
            }

            return sorted;
        }

        /// <summary>Computes average pairwise distance (for display in the UI)</summary>
        private static double ComputeAvgPairwiseDistance(List<(double Lat, double Lng, Order Order, string? Address)> items)
        {
            double total = 0;
            int count = 0;
            for (int i = 0; i < items.Count - 1; i++)
            {
                total += Haversine(items[i].Lat, items[i].Lng, items[i + 1].Lat, items[i + 1].Lng);
                count++;
            }
            return count > 0 ? total / count : 0;
        }

        /// <summary>Returns Arabic letters A=أ, B=ب, etc. for group labels</summary>
        private static string GetArabicLetter(int n)
        {
            var letters = new[] { "أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي" };
            return n <= letters.Length ? letters[n - 1] : n.ToString();
        }
    }
}
