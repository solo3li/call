using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Orders;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Json;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly FoodRMSDbContext _context;
        private readonly IOrderNotifier _orderNotifier;
        private readonly ITenantService _tenantService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IHttpClientFactory _httpClientFactory;

        public OrderService(FoodRMSDbContext context, IOrderNotifier orderNotifier, ITenantService tenantService, IHttpContextAccessor httpContextAccessor, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _orderNotifier = orderNotifier;
            _tenantService = tenantService;
            _httpContextAccessor = httpContextAccessor;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request)
        {
            var activeDay = await _context.BusinessDays.FirstOrDefaultAsync(b => b.EndedAt == null);
            if (activeDay == null)
            {
                throw new InvalidOperationException("يجب بدء اليوم التشغيلي أولاً لإنشاء طلبات.");
            }

            var menuItems = await _context.MenuItems
                .Where(i => request.Items.Select(ri => ri.MenuItemId).Contains(i.Id))
                .ToListAsync();

            decimal totalAmount = 0;
            decimal deliveryCost = 0;
            var itemsSummaryList = new List<string>();

            foreach (var itemRequest in request.Items)
            {
                var menuItem = menuItems.FirstOrDefault(i => i.Id == itemRequest.MenuItemId);
                if (menuItem != null)
                {
                    totalAmount += menuItem.Price * itemRequest.Quantity;
                    itemsSummaryList.Add($"{itemRequest.Quantity}x {menuItem.Name}");
                }
            }

            if (request.OrderType == "توصيل" || request.OrderType == "Delivery")
            {
                if (request.AddressId.HasValue)
                {
                    var address = await _context.CustomerAddresses
                        .Include(a => a.DeliveryZone)
                        .FirstOrDefaultAsync(a => a.Id == request.AddressId.Value);
                    
                    if (address?.DeliveryZone != null)
                    {
                        deliveryCost = address.DeliveryZone.DeliveryCost;
                        totalAmount += deliveryCost;
                    }
                }
                else
                {
                    // Default delivery fee if no specific zone/address selected
                    deliveryCost = 15;
                    totalAmount += deliveryCost;
                }
            }

            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? staffId = null;
            if (Guid.TryParse(userId, out var sId)) staffId = sId;

            // Fallback for TenantId if not set by middleware (e.g. direct IP access)
            var currentTenantId = _tenantService.TenantId;
            if (currentTenantId == Guid.Empty)
            {
                var claimTenantId = _httpContextAccessor.HttpContext?.User?.FindFirstValue("tenantId");
                if (Guid.TryParse(claimTenantId, out var ctId))
                {
                    currentTenantId = ctId;
                    _tenantService.SetTenant(ctId);
                }
            }

            var maxSeq = await _context.Orders.Where(o => o.BusinessDayId == activeDay.Id).MaxAsync(o => (int?)o.DailySequenceNumber) ?? 0;
            var nextSeq = maxSeq + 1;

            var order = new Order
            {
                OrderNumber = $"#{nextSeq}",
                BusinessDayId = activeDay.Id,
                DailySequenceNumber = nextSeq,
                TotalAmount = totalAmount,
                DeliveryCost = deliveryCost,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                ItemsSummary = string.Join(", ", itemsSummaryList),
                OrderType = request.OrderType ?? "DineIn",
                CustomerName = request.CustomerName ?? "Guest",
                BranchId = request.BranchId,
                CustomerId = request.CustomerId,
                CustomerAddressId = request.AddressId,
                KitchenNotes = request.KitchenNotes ?? string.Empty,
                IsRecurring = request.IsRecurring,
                StaffId = staffId,
                TenantId = currentTenantId,
                ExternalCompanyId = request.ExternalCompanyId,
                ExternalOrderId = request.ExternalOrderId,
                CustomerPhone = request.CustomerPhone
            };

            foreach (var itemRequest in request.Items)
            {
                var menuItem = menuItems.FirstOrDefault(i => i.Id == itemRequest.MenuItemId);
                if (menuItem != null)
                {
                    order.Items.Add(new OrderItem
                    {
                        MenuItemId = menuItem.Id,
                        Quantity = itemRequest.Quantity,
                        Price = menuItem.Price,
                        TenantId = currentTenantId
                    });
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirstValue("name") ?? "System";

            _context.OrderAudits.Add(new OrderAudit
            {
                OrderId = order.Id,
                UserId = staffId,
                UserName = currentUserName,
                Action = "Create",
                Changes = $"Order created with {request.Items.Count} items. Total: {totalAmount}",
                TenantId = currentTenantId
            });
            await _context.SaveChangesAsync();

            var response = MapToResponse(order);

            // Notify via SignalR
            await _orderNotifier.NotifyNewOrderAsync(currentTenantId.ToString(), response);

            return response;
        }

        public async Task<List<OrderResponse>> GetRecentOrdersAsync(Guid? branchId = null, int count = 6, string? deliveryType = null, string? externalCompanyId = null)
        {
            var activeDay = await _context.BusinessDays.FirstOrDefaultAsync(b => b.EndedAt == null);
            if (activeDay == null) return new List<OrderResponse>();

            var query = _context.Orders.Where(o => o.BusinessDayId == activeDay.Id).AsQueryable();
            if (branchId.HasValue)
            {
                query = query.Where(o => o.BranchId == branchId.Value);
            }

            if (!string.IsNullOrEmpty(deliveryType) && deliveryType != "All")
            {
                if (deliveryType == "Internal")
                {
                    query = query.Where(o => !o.IsExternalDelivery);
                }
                else if (deliveryType == "External")
                {
                    query = query.Where(o => o.IsExternalDelivery);
                }
            }

            if (!string.IsNullOrEmpty(externalCompanyId) && externalCompanyId != "All")
            {
                if (externalCompanyId == "Unspecified")
                {
                    query = query.Where(o => o.IsExternalDelivery && o.ExternalCompanyId == null);
                }
                else if (Guid.TryParse(externalCompanyId, out var parsedCompanyId))
                {
                    query = query.Where(o => o.ExternalCompanyId == parsedCompanyId);
                }
            }

            var orders = await query
                .Include(o => o.Customer)
                .Include(o => o.CustomerAddress)
                .Include(o => o.ExternalCompany)
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .ToListAsync();

            return orders.GroupBy(o => o.Id).Select(g => g.First()).Select(o => MapToResponseStatic(o)).ToList();
        }

        public async Task<List<OrderResponse>> GetAllOrdersAsync(Guid? branchId = null, string? deliveryType = null, string? externalCompanyId = null)
        {
            var activeDay = await _context.BusinessDays.FirstOrDefaultAsync(b => b.EndedAt == null);
            if (activeDay == null) return new List<OrderResponse>();

            var query = _context.Orders.Where(o => o.BusinessDayId == activeDay.Id).AsQueryable();
            if (branchId.HasValue)
            {
                query = query.Where(o => o.BranchId == branchId.Value);
            }

            if (!string.IsNullOrEmpty(deliveryType) && deliveryType != "All")
            {
                if (deliveryType == "Internal")
                {
                    query = query.Where(o => !o.IsExternalDelivery);
                }
                else if (deliveryType == "External")
                {
                    query = query.Where(o => o.IsExternalDelivery);
                }
            }

            if (!string.IsNullOrEmpty(externalCompanyId) && externalCompanyId != "All")
            {
                if (externalCompanyId == "Unspecified")
                {
                    query = query.Where(o => o.IsExternalDelivery && o.ExternalCompanyId == null);
                }
                else if (Guid.TryParse(externalCompanyId, out var parsedCompanyId))
                {
                    query = query.Where(o => o.ExternalCompanyId == parsedCompanyId);
                }
            }

            var orders = await query
                .Include(o => o.Customer)
                .Include(o => o.CustomerAddress)
                .Include(o => o.ExternalCompany)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.GroupBy(o => o.Id).Select(g => g.First()).Select(o => MapToResponseStatic(o)).ToList();
        }

        public async Task<List<OrderResponse>> GetCustomerOrdersAsync(Guid customerId)
        {
            var query = _context.Orders.Where(o => o.CustomerId == customerId).AsQueryable();

            var orders = await query
                .Include(o => o.Customer)
                .Include(o => o.CustomerAddress)
                .Include(o => o.ExternalCompany)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.GroupBy(o => o.Id).Select(g => g.First()).Select(o => MapToResponseStatic(o)).ToList();
        }

        public async Task<List<OrderDetailsResponse>> GetActiveOrdersDetailsAsync(Guid? branchId = null)
        {
            var activeDay = await _context.BusinessDays.FirstOrDefaultAsync(b => b.EndedAt == null);
            if (activeDay == null) return new List<OrderDetailsResponse>();

            var query = _context.Orders.Where(o => o.BusinessDayId == activeDay.Id && o.Status != "Delivered" && o.Status != "Cancelled").AsQueryable();
            if (branchId.HasValue)
            {
                query = query.Where(o => o.BranchId == branchId.Value);
            }

            var orders = await query
                .Include(o => o.Items)
                .Include(o => o.Customer)
                .Include(o => o.CustomerAddress)
                .Include(o => o.ExternalCompany)
                .OrderByDescending(o => o.CreatedAt)
                .AsSplitQuery()
                .ToListAsync();

            orders = orders.Distinct().ToList();

            var menuItems = await _context.MenuItems.IgnoreQueryFilters().Include(m => m.KitchenStation).ToListAsync();

            return orders.Select(order => new OrderDetailsResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                CustomerName = order.CustomerName,
                CustomerPhone = order.Customer?.PhoneNumber ?? string.Empty,
                BranchId = order.BranchId,
                ItemsSummary = order.ItemsSummary,
                TotalAmount = order.TotalAmount,
                DeliveryCost = order.DeliveryCost,
                Status = order.Status,
                OrderType = order.OrderType,
                KitchenNotes = order.KitchenNotes,
                IsRecurring = order.IsRecurring,
                CreatedAt = order.CreatedAt,
                IsExternalDelivery = order.IsExternalDelivery,
                DriverName = order.DriverName,
                DriverPhone = order.DriverPhone,
                CustomerAddress = order.CustomerAddress?.AddressDetails,
                CustomerLatitude = order.CustomerAddress?.Latitude,
                CustomerLongitude = order.CustomerAddress?.Longitude,
                ExternalCompanyId = order.ExternalCompanyId,
                ExternalCompanyName = order.ExternalCompany?.Name,
                ExternalOrderId = order.ExternalOrderId,
                Items = order.Items.Select(i => {
                    var m = menuItems.FirstOrDefault(x => x.Id == i.MenuItemId);
                    return new OrderItemDetailResponse
                    {
                        Id = i.Id,
                        MenuItemId = i.MenuItemId,
                        MenuItemName = m?.Name ?? "Unknown",
                        Quantity = i.Quantity,
                        Price = i.Price,
                        Status = i.Status.ToString(),
                        KitchenStationName = m?.KitchenStation?.Name
                    };
                }).ToList(),
                Audits = new List<OrderAuditResponse>()
            }).ToList();
        }

        public async Task<OrderResponse?> UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await _context.Orders.Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return null;

            var oldStatus = order.Status;
            order.Status = status;
            await _context.SaveChangesAsync();

            var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirstValue("name") ?? "System";
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? staffId = null;
            if (Guid.TryParse(userIdStr, out var sId)) staffId = sId;

            _context.OrderAudits.Add(new OrderAudit
            {
                OrderId = order.Id,
                UserId = staffId,
                UserName = currentUserName,
                Action = "UpdateStatus",
                Changes = $"Status changed from {oldStatus} to {status}",
                TenantId = order.TenantId
            });
            await _context.SaveChangesAsync();

            var response = MapToResponse(order);
            await _orderNotifier.NotifyNewOrderAsync(_tenantService.TenantId.ToString(), response);

            // Send automatic Telegram message if customer is linked
            try
            {
                if (order.Customer != null && order.Customer.TelegramChatId.HasValue)
                {
                    var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == order.TenantId);
                    if (tenant != null && !string.IsNullOrEmpty(tenant.TelegramBotToken))
                    {
                        var statusAr = status == "Pending" ? "معلق ⏳" :
                                       status == "Preparing" ? "جاري التحضير 🍳" :
                                       status == "Completed" ? "مكتمل وجاهز ✅" :
                                       status == "Delivered" ? "تم التوصيل 🛵" : "ملغي ❌";

                        var client = _httpClientFactory.CreateClient();
                        var sendUrl = $"https://api.telegram.org/bot{tenant.TelegramBotToken}/sendMessage";
                        await client.PostAsJsonAsync(sendUrl, new
                        {
                            chat_id = order.Customer.TelegramChatId.Value,
                            text = $"🔔 تحديث تلقائي لطلبك رقم {order.OrderNumber}:\n\nحالة الطلب الآن: {statusAr}\n\nشكراً لاختيارك مطعم {tenant.Name}! 😊"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrderService] Telegram notification error: {ex.Message}");
            }

            return response;
        }

        public async Task<OrderDetailsResponse?> UpdateOrderItemStatusAsync(Guid orderId, int itemId, string status)
        {
            var order = await _context.Orders.Include(o => o.Items).Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return null;

            var item = order.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return null;

            if (Enum.TryParse<OrderItemStatus>(status, true, out var newStatus))
            {
                var oldStatus = item.Status;
                item.Status = newStatus;

                // Auto-complete order if all items are ready
                bool allReady = order.Items.All(i => i.Status == OrderItemStatus.Ready);
                if (allReady && order.Status != "Completed")
                {
                    order.Status = "Completed";
                }
                else if (!allReady && order.Status == "Pending" && order.Items.Any(i => i.Status == OrderItemStatus.Preparing || i.Status == OrderItemStatus.Ready))
                {
                    order.Status = "Preparing";
                }

                await _context.SaveChangesAsync();

                var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirstValue("name") ?? "System";
                var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                Guid? staffId = null;
                if (Guid.TryParse(userIdStr, out var sId)) staffId = sId;

                _context.OrderAudits.Add(new OrderAudit
                {
                    OrderId = order.Id,
                    UserId = staffId,
                    UserName = currentUserName,
                    Action = "UpdateItemStatus",
                    Changes = $"Item {itemId} status changed from {oldStatus} to {newStatus}",
                    TenantId = order.TenantId
                });
                await _context.SaveChangesAsync();

                var response = await GetOrderDetailsAsync(order.Id);
                if (response != null)
                {
                    await _orderNotifier.NotifyNewOrderAsync(_tenantService.TenantId.ToString(), response);
                }

                return response;
            }

            return null;
        }

        public async Task<OrderDetailsResponse?> GetOrderDetailsAsync(Guid orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Customer)
                .Include(o => o.ExternalCompany)
                .FirstOrDefaultAsync(o => o.Id == orderId);
                
            if (order == null) return null;

            var menuItems = await _context.MenuItems.IgnoreQueryFilters().Include(m => m.KitchenStation).Where(m => order.Items.Select(i => i.MenuItemId).Contains(m.Id)).ToListAsync();
            var audits = await _context.OrderAudits.Where(a => a.OrderId == orderId).OrderByDescending(a => a.Timestamp).ToListAsync();

            var response = new OrderDetailsResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                CustomerName = order.CustomerName,
                CustomerPhone = order.Customer?.PhoneNumber ?? string.Empty,
                ItemsSummary = order.ItemsSummary,
                TotalAmount = order.TotalAmount,
                DeliveryCost = order.DeliveryCost,
                Status = order.Status,
                OrderType = order.OrderType,
                KitchenNotes = order.KitchenNotes,
                IsRecurring = order.IsRecurring,
                CreatedAt = order.CreatedAt,
                IsExternalDelivery = order.IsExternalDelivery,
                Items = order.Items.Select(i => {
                    var m = menuItems.FirstOrDefault(x => x.Id == i.MenuItemId);
                    return new OrderItemDetailResponse
                    {
                        Id = i.Id,
                        MenuItemId = i.MenuItemId,
                        MenuItemName = m?.Name ?? "Unknown",
                        Quantity = i.Quantity,
                        Price = i.Price,
                        Status = i.Status.ToString(),
                        KitchenStationName = m?.KitchenStation?.Name
                    };
                }).ToList(),
                Audits = audits.Select(a => new OrderAuditResponse
                {
                    Id = a.Id,
                    UserName = a.UserName,
                    Action = a.Action,
                    Changes = a.Changes,
                    Timestamp = a.Timestamp
                }).ToList()
            };

            return response;
        }

        public async Task<OrderResponse?> EditOrderAsync(Guid orderId, EditOrderRequest request)
        {
            var order = await _context.Orders.Include(o => o.Items).Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null || (order.Status != "Pending" && order.Status != "معلق")) return null; // Only edit if not preparing/completed

            var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirstValue("name") ?? "System";
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? staffId = null;
            if (Guid.TryParse(userIdStr, out var sId)) staffId = sId;

            var changes = new List<string>();

            if (request.CustomerName != null && order.CustomerName != request.CustomerName)
            {
                changes.Add($"CustomerName: {order.CustomerName} -> {request.CustomerName}");
                order.CustomerName = request.CustomerName;
            }
            if (request.OrderType != null && order.OrderType != request.OrderType)
            {
                changes.Add($"OrderType: {order.OrderType} -> {request.OrderType}");
                order.OrderType = request.OrderType;
            }
            if (request.KitchenNotes != null && order.KitchenNotes != request.KitchenNotes)
            {
                changes.Add($"KitchenNotes: '{order.KitchenNotes}' -> '{request.KitchenNotes}'");
                order.KitchenNotes = request.KitchenNotes;
            }

            if (request.Items != null && request.Items.Any())
            {
                // Re-calculate items
                _context.OrderItems.RemoveRange(order.Items);
                
                var menuItems = await _context.MenuItems
                    .Where(i => request.Items.Select(ri => ri.MenuItemId).Contains(i.Id))
                    .ToListAsync();

                decimal totalAmount = 0;
                var itemsSummaryList = new List<string>();

                foreach (var itemRequest in request.Items)
                {
                    var menuItem = menuItems.FirstOrDefault(i => i.Id == itemRequest.MenuItemId);
                    if (menuItem != null)
                    {
                        totalAmount += menuItem.Price * itemRequest.Quantity;
                        itemsSummaryList.Add($"{itemRequest.Quantity}x {menuItem.Name}");
                        
                        order.Items.Add(new OrderItem
                        {
                            MenuItemId = menuItem.Id,
                            Quantity = itemRequest.Quantity,
                            Price = menuItem.Price,
                            TenantId = order.TenantId
                        });
                    }
                }
                
                // Keep existing delivery cost in total
                totalAmount += order.DeliveryCost;
                
                if (order.TotalAmount != totalAmount)
                {
                    changes.Add($"TotalAmount: {order.TotalAmount} -> {totalAmount}");
                    order.TotalAmount = totalAmount;
                }
                if (order.ItemsSummary != string.Join(", ", itemsSummaryList))
                {
                    changes.Add($"Items: {order.ItemsSummary} -> {string.Join(", ", itemsSummaryList)}");
                    order.ItemsSummary = string.Join(", ", itemsSummaryList);
                }
            }

            if (changes.Any())
            {
                _context.OrderAudits.Add(new OrderAudit
                {
                    OrderId = order.Id,
                    UserId = staffId,
                    UserName = currentUserName,
                    Action = "EditDetails",
                    Changes = string.Join(" | ", changes),
                    TenantId = order.TenantId
                });
                await _context.SaveChangesAsync();
                
                var response = MapToResponse(order);
                await _orderNotifier.NotifyNewOrderAsync(_tenantService.TenantId.ToString(), response);
                return response;
            }
            
            return MapToResponse(order);
        }

        private OrderResponse MapToResponse(Order order)
        {
            return new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                CustomerName = order.CustomerName,
                CustomerPhone = order.Customer?.PhoneNumber ?? string.Empty,
                BranchId = order.BranchId,
                ItemsSummary = order.ItemsSummary,
                TotalAmount = order.TotalAmount,
                DeliveryCost = order.DeliveryCost,
                Status = order.Status,
                OrderType = order.OrderType,
                KitchenNotes = order.KitchenNotes,
                IsRecurring = order.IsRecurring,
                CreatedAt = order.CreatedAt,
                IsExternalDelivery = order.IsExternalDelivery,
                DriverName = order.DriverName,
                DriverPhone = order.DriverPhone,
                CustomerAddress = order.CustomerAddress?.AddressDetails,
                CustomerLatitude = order.CustomerAddress?.Latitude,
                CustomerLongitude = order.CustomerAddress?.Longitude,
                ExternalCompanyId = order.ExternalCompanyId,
                ExternalCompanyName = order.ExternalCompany?.Name,
                ExternalOrderId = order.ExternalOrderId
            };
        }

        private static OrderResponse MapToResponseStatic(Order order)
        {
            return new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                CustomerName = order.CustomerName,
                CustomerPhone = order.Customer?.PhoneNumber ?? string.Empty,
                BranchId = order.BranchId,
                ItemsSummary = order.ItemsSummary,
                TotalAmount = order.TotalAmount,
                DeliveryCost = order.DeliveryCost,
                Status = order.Status,
                OrderType = order.OrderType,
                KitchenNotes = order.KitchenNotes,
                IsRecurring = order.IsRecurring,
                CreatedAt = order.CreatedAt,
                DriverName = order.DriverName,
                DriverPhone = order.DriverPhone,
                CustomerAddress = order.CustomerAddress?.AddressDetails,
                CustomerLatitude = order.CustomerAddress?.Latitude,
                CustomerLongitude = order.CustomerAddress?.Longitude,
                ExternalCompanyId = order.ExternalCompanyId,
                ExternalOrderId = order.ExternalOrderId
            };
        }

        public async Task<OrderResponse?> AssignDriverAsync(Guid orderId, string driverName, string driverPhone)
        {
            var order = await _context.Orders.Include(o => o.Customer).Include(o => o.CustomerAddress).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return null;

            order.DriverName = driverName;
            order.DriverPhone = driverPhone;
            if (order.Status != "Delivering" && order.Status != "قيد التوصيل")
            {
                order.Status = "Delivering";
            }
            await _context.SaveChangesAsync();

            var response = MapToResponse(order);
            await _orderNotifier.NotifyNewOrderAsync(_tenantService.TenantId.ToString(), response);
            return response;
        }
    }
}
