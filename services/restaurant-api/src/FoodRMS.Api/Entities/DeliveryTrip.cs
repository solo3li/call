using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    /// <summary>
    /// Represents a delivery trip: a group of nearby orders assigned to one driver.
    /// Created by the delivery manager from the AI-suggested groupings.
    /// </summary>
    public class DeliveryTrip : ITenantEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Name or number of the trip for display</summary>
        public string TripNumber { get; set; } = string.Empty;

        public string DriverName { get; set; } = string.Empty;
        public string DriverPhone { get; set; } = string.Empty;

        /// <summary>Trip status: Pending, InProgress, Completed</summary>
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public Guid? BranchId { get; set; }
        public Branch? Branch { get; set; }

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        /// <summary>Orders that are part of this trip</summary>
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
