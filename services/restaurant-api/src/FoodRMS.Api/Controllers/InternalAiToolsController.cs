using Microsoft.AspNetCore.Mvc;
using FoodRMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using System;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/internal/ai-tools")]
    public class InternalAiToolsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public InternalAiToolsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        private async Task<Guid?> GetTenantIdFromExtension(string extension)
        {
            var sipSetting = await _context.TenantSipSettings.FirstOrDefaultAsync(s => s.AgentExtension == extension);
            return sipSetting?.TenantId;
        }

        [HttpGet("customer")]
        public async Task<IActionResult> GetCustomer([FromQuery] string extension, [FromQuery] string phone)
        {
            var tenantId = await GetTenantIdFromExtension(extension);
            if (tenantId == null) return NotFound("Tenant not found");

            var customer = await _context.Customers
                .Where(c => c.TenantId == tenantId && c.PhoneNumber == phone)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.PhoneNumber,
                    RecentOrders = _context.Orders
                        .Where(o => o.CustomerId == c.Id)
                        .OrderByDescending(o => o.CreatedAt)
                        .Take(3)
                        .Select(o => new { o.Id, o.OrderNumber, o.TotalAmount, o.Status, o.CreatedAt })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                return Ok(new { exists = false, message = "Customer not found." });
            }

            return Ok(new { exists = true, customer });
        }

        [HttpGet("menu")]
        public async Task<IActionResult> SearchMenu([FromQuery] string extension, [FromQuery] string query)
        {
            var tenantId = await GetTenantIdFromExtension(extension);
            if (tenantId == null) return NotFound("Tenant not found");

            var itemsQuery = _context.MenuItems
                .Where(m => m.TenantId == tenantId && m.IsAvailable);

            if (!string.IsNullOrEmpty(query))
            {
                itemsQuery = itemsQuery.Where(m => m.Name.Contains(query) || m.Description.Contains(query));
            }

            var items = await itemsQuery
                .Select(m => new { m.Id, m.Name, m.Description, m.Price })
                .Take(10)
                .ToListAsync();

            return Ok(new { results = items });
        }

        public class CreateOrderRequest
        {
            public string Extension { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string CustomerName { get; set; } = string.Empty;
            public string ItemsSummary { get; set; } = string.Empty;
            public decimal TotalAmount { get; set; }
        }

        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var tenantId = await GetTenantIdFromExtension(request.Extension);
            if (tenantId == null) return NotFound("Tenant not found");

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.PhoneNumber == request.Phone);

            if (customer == null && !string.IsNullOrEmpty(request.Phone))
            {
                customer = new Customer
                {
                    TenantId = tenantId.Value,
                    PhoneNumber = request.Phone,
                    Name = string.IsNullOrEmpty(request.CustomerName) ? "AI Customer" : request.CustomerName
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.TenantId == tenantId);

            var order = new Order
            {
                TenantId = tenantId.Value,
                CustomerId = customer?.Id,
                CustomerName = customer?.Name ?? "AI Customer",
                CustomerPhone = request.Phone,
                OrderNumber = "AI-" + new Random().Next(1000, 9999).ToString(),
                Status = "Pending",
                OrderType = "Delivery",
                ItemsSummary = request.ItemsSummary,
                TotalAmount = request.TotalAmount,
                CreatedAt = DateTime.UtcNow,
                BranchId = branch?.Id
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderNumber = order.OrderNumber, status = order.Status });
        }

        public class TransferRequest
        {
            public string Extension { get; set; } = string.Empty;
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> TransferToHuman([FromBody] TransferRequest request)
        {
            var tenantId = await GetTenantIdFromExtension(request.Extension);
            if (tenantId == null) return NotFound("Tenant not found");

            // TODO: Here we would ideally connect to Asterisk AMI to execute a redirect
            // For now, we will simulate the transfer in the AI's flow by acknowledging it.
            // Asterisk AMI implementation would look something like:
            // AmiManager.Redirect(channel, context, extension, priority)
            
            return Ok(new { success = true, message = "Call marked for transfer." });
        }
    }
}
