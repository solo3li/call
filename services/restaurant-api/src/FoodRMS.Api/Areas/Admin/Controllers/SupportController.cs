using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Linq;
using System;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;

namespace FoodRMS.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class SupportController : Controller
    {
        private readonly FoodRMSDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<FoodRMS.Api.Hubs.SupportHub> _hubContext;
        private readonly IHttpClientFactory _httpClientFactory;

        public SupportController(FoodRMSDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<FoodRMS.Api.Hubs.SupportHub> hubContext, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _hubContext = hubContext;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<IActionResult> Index([FromQuery] string? filter)
        {
            var query = _context.SupportTickets
                .Include(t => t.Tenant)
                .AsQueryable();

            if (filter == "complaints")
            {
                query = query.Where(t => t.IsComplaint);
            }

            var tickets = await query.OrderByDescending(t => t.UpdatedAt).ToListAsync();
            ViewBag.CurrentFilter = filter;
            return View(tickets);
        }

        public async Task<IActionResult> Chat(Guid id)
        {
            var ticket = await _context.SupportTickets
                .Include(t => t.Tenant)
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null) return NotFound();

            // Mark updated so it bubbles up
            return View(ticket);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(Guid ticketId, string text, string messageType, IFormFile? attachment, Guid? replyToMessageId)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();

            var message = new SupportMessage
            {
                Id = Guid.NewGuid(),
                SupportTicketId = ticketId,
                Sender = "Admin",
                Text = text ?? string.Empty,
                MessageType = messageType ?? "Text",
                ReplyToMessageId = replyToMessageId,
                CreatedAt = DateTime.UtcNow
            };

            if (attachment != null && attachment.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "support");
                Directory.CreateDirectory(uploadsFolder);
                var uniqueName = Guid.NewGuid().ToString() + "_" + attachment.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }

                message.AttachmentUrl = "/uploads/support/" + uniqueName;
                message.AttachmentName = attachment.FileName;
            }

            _context.SupportMessages.Add(message);
            ticket.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Two-way messaging: Send back to customer on Telegram if linked
            try
            {
                if (ticket.TelegramChatId.HasValue)
                {
                    var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == ticket.TenantId);
                    if (tenant != null && !string.IsNullOrEmpty(tenant.TelegramBotToken))
                    {
                        var client = _httpClientFactory.CreateClient();
                        var sendUrl = $"https://api.telegram.org/bot{tenant.TelegramBotToken}/sendMessage";
                        var msgPrefix = "👩‍💻 رد من موظف خدمة العملاء:\n";
                        await client.PostAsJsonAsync(sendUrl, new
                        {
                            chat_id = ticket.TelegramChatId.Value,
                            text = msgPrefix + (text ?? string.Empty)
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SupportController] Telegram reply error: {ex.Message}");
            }

            var messageDto = new {
                message.Id,
                message.Sender,
                message.Text,
                message.MessageType,
                message.AttachmentUrl,
                message.AttachmentName,
                message.ReplyToMessageId,
                message.CreatedAt
            };

            await _hubContext.Clients.Group(ticketId.ToString()).SendAsync("ReceiveMessage", messageDto);

            return Json(new { success = true, message = messageDto });
        }
    }
}