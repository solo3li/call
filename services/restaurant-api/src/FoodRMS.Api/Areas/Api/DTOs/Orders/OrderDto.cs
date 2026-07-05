using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Orders
{
    public class CreateOrderRequest
    {
        public List<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
        public string? OrderType { get; set; }
        public string? CustomerName { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? CustomerId { get; set; }
        public int? AddressId { get; set; }
        public string? KitchenNotes { get; set; }
        public bool IsRecurring { get; set; }
        public Guid? ExternalCompanyId { get; set; }
        public string? ExternalOrderId { get; set; }
        public string? CustomerPhone { get; set; }
    }

    public class OrderItemRequest
    {
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderResponse
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public string ItemsSummary { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal DeliveryCost { get; set; }
        public string Status { get; set; } = string.Empty;
        public string OrderType { get; set; } = string.Empty;
        public string KitchenNotes { get; set; } = string.Empty;
        public bool IsRecurring { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsExternalDelivery { get; set; }
        public Guid? ExternalCompanyId { get; set; }
        public string? ExternalCompanyName { get; set; }
        public string? ExternalOrderId { get; set; }
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
        
        /// <summary>Text address from CustomerAddress.AddressDetails</summary>
        public string? CustomerAddress { get; set; }
        
        /// <summary>GPS latitude from CustomerAddress.Latitude (null if not set)</summary>
        public double? CustomerLatitude { get; set; }
        
        /// <summary>GPS longitude from CustomerAddress.Longitude (null if not set)</summary>
        public double? CustomerLongitude { get; set; }
    }
}
