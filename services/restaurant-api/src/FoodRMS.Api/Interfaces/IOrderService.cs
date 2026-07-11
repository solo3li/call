using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Orders;

namespace FoodRMS.Api.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request);
        Task<List<OrderResponse>> GetRecentOrdersAsync(Guid? branchId = null, int count = 6, string? deliveryType = null, string? externalCompanyId = null);
        Task<List<OrderResponse>> GetAllOrdersAsync(Guid? branchId = null, string? deliveryType = null, string? externalCompanyId = null);
        Task<List<OrderResponse>> GetCustomerOrdersAsync(Guid customerId);
        Task<List<OrderDetailsResponse>> GetActiveOrdersDetailsAsync(Guid? branchId = null);
        Task<OrderResponse?> UpdateOrderStatusAsync(Guid orderId, string status);
        Task<OrderDetailsResponse?> UpdateOrderItemStatusAsync(Guid orderId, int itemId, string status);
        Task<OrderResponse?> EditOrderAsync(Guid orderId, EditOrderRequest request);
        Task<OrderDetailsResponse?> GetOrderDetailsAsync(Guid orderId);
        Task<OrderResponse?> AssignDriverAsync(Guid orderId, string driverName, string driverPhone);
    }
}
