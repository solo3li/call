using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Orders
{
    public class OrderItemDetailResponse
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? KitchenStationName { get; set; }
    }

    public class OrderDetailsResponse : OrderResponse
    {
        public List<OrderItemDetailResponse> Items { get; set; } = new();
        public List<OrderAuditResponse> Audits { get; set; } = new();
    }
}
