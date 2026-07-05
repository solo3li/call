using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class Order : ITenantEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid? BusinessDayId { get; set; }
        public BusinessDay? BusinessDay { get; set; }
        
        public int DailySequenceNumber { get; set; }
        
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string ItemsSummary { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string OrderType { get; set; } = "DineIn"; // DineIn, Delivery, Takeaway
        public string KitchenNotes { get; set; } = string.Empty;
        public bool IsRecurring { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? Rating { get; set; }
        
        // Delivery driver info (set when order moves to "Delivering" status)
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
        
        public Guid? BranchId { get; set; }
        public Branch? Branch { get; set; }
        
        public Guid? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public int? CustomerAddressId { get; set; }
        public CustomerAddress? CustomerAddress { get; set; }

        public decimal DeliveryCost { get; set; }

        public Guid? StaffId { get; set; }
        public User? Staff { get; set; }

        // Smart Delivery Routing — link to a DeliveryTrip when grouped
        public Guid? DeliveryTripId { get; set; }
        public DeliveryTrip? DeliveryTrip { get; set; }

        public Guid? ExternalCompanyId { get; set; }
        public ExternalCompany? ExternalCompany { get; set; }
        public string? ExternalOrderId { get; set; }
        public bool IsExternalDelivery { get; set; }
        public string? CustomerPhone { get; set; }

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
