using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class OrderItem : ITenantEntity
    {
        public int Id { get; set; }
        
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;
        
        public int MenuItemId { get; set; }
        public MenuItem MenuItem { get; set; } = null!;
        
        public int Quantity { get; set; }
        public decimal Price { get; set; } // Historical price at time of order
        public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;

        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
