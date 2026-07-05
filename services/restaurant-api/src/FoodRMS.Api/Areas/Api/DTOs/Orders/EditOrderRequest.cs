using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Orders
{
    public class EditOrderRequest
    {
        public string? OrderType { get; set; }
        public string? CustomerName { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? CustomerId { get; set; }
        public int? AddressId { get; set; }
        public string? KitchenNotes { get; set; }
        public List<OrderItemRequest> Items { get; set; } = new();
    }
}
