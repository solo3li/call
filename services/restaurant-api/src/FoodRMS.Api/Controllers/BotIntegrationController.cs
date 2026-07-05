using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Hubs;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/bot-integration")]
    public class BotIntegrationController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly IOrderNotifier _orderNotifier;
        private readonly IConfiguration _config;

        public BotIntegrationController(FoodRMSDbContext context, IOrderNotifier orderNotifier, IConfiguration config)
        {
            _context = context;
            _orderNotifier = orderNotifier;
            _config = config;
        }

        private bool ValidateSecret()
        {
            var headerSecret = Request.Headers["X-Bot-Secret"].FirstOrDefault();
            var configSecret = _config["BotWorker:ApiSecret"] ?? "this_is_a_secure_internal_secret_key_123";
            return headerSecret == configSecret;
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> GetTenants()
        {
            if (!ValidateSecret()) return Unauthorized();
            
            var tenants = await _context.Tenants
                .IgnoreQueryFilters()
                .Where(t => !string.IsNullOrEmpty(t.TelegramBotToken))
                .Select(t => new { t.Id, t.TelegramBotToken })
                .ToListAsync();
            
            return Ok(tenants);
        }

        [HttpGet("state/{tenantId}")]
        public async Task<IActionResult> GetState(Guid tenantId)
        {
            if (!ValidateSecret()) return Unauthorized();

            var menuItems = await _context.MenuItems
                .IgnoreQueryFilters()
                .Where(m => m.TenantId == tenantId)
                .Include(m => m.Category)
                .ToListAsync();

            var businessDay = await _context.BusinessDays
                .IgnoreQueryFilters()
                .Where(b => b.TenantId == tenantId && b.EndedAt == null)
                .OrderByDescending(b => b.StartedAt)
                .FirstOrDefaultAsync();

            var tenant = await _context.Tenants
                .IgnoreQueryFilters()
                .Include(t => t.Currency)
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            var currency = tenant?.Currency;

            return Ok(new
            {
                IsStoreOpen = businessDay != null,
                CurrencySymbol = currency?.Symbol ?? "$",
                MenuItems = menuItems.Select(m => new {
                    m.Id,
                    m.Name,
                    m.Description,
                    m.Price,
                    CategoryName = m.Category?.Name ?? "General"
                })
            });
        }

        public class BotOrderRequest
        {
            public long ChatId { get; set; }
            public string Username { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public List<int> MenuItemIds { get; set; } = new();
            public decimal TotalAmount { get; set; }
        }

        [HttpPost("orders/{tenantId}")]
        public async Task<IActionResult> CreateOrder(Guid tenantId, [FromBody] BotOrderRequest request)
        {
            if (!ValidateSecret()) return Unauthorized();

            var customer = await _context.Customers
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.TelegramChatId == request.ChatId);

            if (customer == null)
            {
                customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    TelegramChatId = request.ChatId,
                    Name = request.Username,
                    PhoneNumber = request.Phone,
                    Addresses = request.Address
                };
                _context.Customers.Add(customer);
            }
            else
            {
                if (!string.IsNullOrEmpty(request.Address)) customer.Addresses = request.Address;
                if (!string.IsNullOrEmpty(request.Phone)) customer.PhoneNumber = request.Phone;
                _context.Customers.Update(customer);
            }

            var order = new Order
            {
                TenantId = tenantId,
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                KitchenNotes = "Delivery Address: " + request.Address,
                TotalAmount = request.TotalAmount,
                OrderType = "Delivery",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                Items = request.MenuItemIds.Select(id => new OrderItem
                {
                    TenantId = tenantId,
                    MenuItemId = id,
                    Quantity = 1
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            await _orderNotifier.NotifyNewOrderAsync(tenantId.ToString(), order);

            return Ok(new { order.Id, order.OrderNumber });
        }

        [HttpGet("orders/{tenantId}/{chatId}")]
        public async Task<IActionResult> GetActiveOrders(Guid tenantId, long chatId)
        {
            if (!ValidateSecret()) return Unauthorized();

            var customer = await _context.Customers
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.TelegramChatId == chatId);

            if (customer == null) return Ok(new List<object>());

            var activeOrders = await _context.Orders
                .IgnoreQueryFilters()
                .Where(o => o.TenantId == tenantId && o.CustomerId == customer.Id && o.Status != "Completed" && o.Status != "Cancelled")
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.Status,
                    o.TotalAmount,
                    o.CreatedAt
                })
                .ToListAsync();

            return Ok(activeOrders);
        }
    }
}
