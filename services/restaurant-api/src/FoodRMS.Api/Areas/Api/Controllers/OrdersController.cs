using FoodRMS.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            try
            {
                var result = await _orderService.CreateOrderAsync(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent")]
        public async Task<ActionResult<List<OrderResponse>>> GetRecentOrders([FromQuery] Guid? branchId, [FromQuery] string? deliveryType = null, [FromQuery] string? externalCompanyId = null)
        {
            return await _orderService.GetRecentOrdersAsync(branchId, 6, deliveryType, externalCompanyId);
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderResponse>>> GetAllOrders([FromQuery] Guid? branchId, [FromQuery] string? deliveryType = null, [FromQuery] string? externalCompanyId = null)
        {
            return await _orderService.GetAllOrdersAsync(branchId, deliveryType, externalCompanyId);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<OrderResponse>>> GetCustomerOrders(Guid customerId)
        {
            return await _orderService.GetCustomerOrdersAsync(customerId);
        }

        [HttpGet("kds")]
        public async Task<ActionResult<List<OrderDetailsResponse>>> GetActiveOrdersDetails([FromQuery] Guid? branchId)
        {
            return await _orderService.GetActiveOrdersDetailsAsync(branchId);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailsResponse>> GetOrderDetails(Guid id)
        {
            var result = await _orderService.GetOrderDetailsAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OrderResponse>> EditOrder(Guid id, [FromBody] EditOrderRequest request)
        {
            var result = await _orderService.EditOrderAsync(id, request);
            if (result == null) return BadRequest("Order not found or cannot be edited in its current status.");
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<OrderResponse>> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var result = await _orderService.UpdateOrderStatusAsync(id, request.Status);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}/items/{itemId}/status")]
        public async Task<ActionResult<OrderDetailsResponse>> UpdateItemStatus(Guid id, int itemId, [FromBody] UpdateStatusRequest request)
        {
            var result = await _orderService.UpdateOrderItemStatusAsync(id, itemId, request.Status);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}/driver")]
        public async Task<ActionResult<OrderResponse>> AssignDriver(Guid id, [FromBody] AssignDriverRequest request)
        {
            var result = await _orderService.AssignDriverAsync(id, request.DriverName, request.DriverPhone);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class AssignDriverRequest
    {
        public string DriverName { get; set; } = string.Empty;
        public string DriverPhone { get; set; } = string.Empty;
    }
}
