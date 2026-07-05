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
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class SupportController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<FoodRMS.Api.Hubs.SupportHub> _hubContext;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITenantService _tenantService;

        public SupportController(FoodRMSDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<FoodRMS.Api.Hubs.SupportHub> hubContext, IHttpClientFactory httpClientFactory, ITenantService tenantService)
        {
            _context = context;
            _hubContext = hubContext;
            _httpClientFactory = httpClientFactory;
            _tenantService = tenantService;
        }

        // GET: api/Support/Ticket
        // For prototype, we'll just get or create a demo ticket
        [HttpGet("Ticket")]
        public async Task<IActionResult> GetTicket()
        {
            var tenantId = _tenantService.TenantId;
            var ticket = await _context.SupportTickets
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.Title == "General Support Inquiry");

            if (ticket == null)
            {
                ticket = new SupportTicket
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Title = "General Support Inquiry",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.SupportTickets.Add(ticket);
                await _context.SaveChangesAsync();
            }

            // Return a simple DTO to avoid circular references
            return Ok(new {
                ticket.Id,
                ticket.Title,
                ticket.Status,
                ticket.CustomerName,
                ticket.IsComplaint,
                ticket.TelegramChatId,
                Messages = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new {
                    m.Id,
                    m.Sender,
                    m.Text,
                    m.MessageType,
                    m.AttachmentUrl,
                    m.AttachmentName,
                    m.ReplyToMessageId,
                    m.CreatedAt
                })
            });
        }

        // GET: api/Support/Tickets
        [HttpGet("Tickets")]
        public async Task<IActionResult> GetTickets()
        {
            var tenantId = _tenantService.TenantId;
            var tickets = await _context.SupportTickets
                .Include(t => t.Messages)
                .Where(t => t.TenantId == tenantId)
                .OrderByDescending(t => t.UpdatedAt)
                .Select(t => new {
                    t.Id,
                    t.Title,
                    t.Status,
                    t.CustomerName,
                    t.IsComplaint,
                    t.TelegramChatId,
                    t.CreatedAt,
                    t.UpdatedAt,
                    MessageCount = t.Messages.Count,
                    LastMessage = t.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault() != null 
                        ? t.Messages.OrderByDescending(m => m.CreatedAt).First().Text 
                        : "لا توجد رسائل بعد"
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // GET: api/Support/Ticket/{id}
        [HttpGet("Ticket/{id}")]
        public async Task<IActionResult> GetTicketById(Guid id)
        {
            var tenantId = _tenantService.TenantId;
            var ticket = await _context.SupportTickets
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId);

            if (ticket == null) return NotFound("Ticket not found");

            return Ok(new {
                ticket.Id,
                ticket.Title,
                ticket.Status,
                ticket.CustomerName,
                ticket.IsComplaint,
                ticket.TelegramChatId,
                ticket.CreatedAt,
                ticket.UpdatedAt,
                Messages = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new {
                    m.Id,
                    m.Sender,
                    m.Text,
                    m.MessageType,
                    m.AttachmentUrl,
                    m.AttachmentName,
                    m.ReplyToMessageId,
                    m.CreatedAt
                })
            });
        }

        public class CreateTicketDto
        {
            public string Title { get; set; } = string.Empty;
            public string Category { get; set; } = "General";
            public string Priority { get; set; } = "Medium";
            public string InitialMessage { get; set; } = string.Empty;
            public string CustomerName { get; set; } = string.Empty;
            public bool IsComplaint { get; set; }
        }

        // POST: api/Support/Ticket
        [HttpPost("Ticket")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required");

            var tenantId = _tenantService.TenantId;
            var ticket = new SupportTicket
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Title = $"[{dto.Category} - {dto.Priority}] {dto.Title}",
                Status = "Open",
                CustomerName = dto.CustomerName ?? "Customer",
                IsComplaint = dto.IsComplaint,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (!string.IsNullOrWhiteSpace(dto.InitialMessage))
            {
                var message = new SupportMessage
                {
                    Id = Guid.NewGuid(),
                    SupportTicketId = ticket.Id,
                    Sender = "Customer",
                    Text = dto.InitialMessage,
                    MessageType = "Text",
                    CreatedAt = DateTime.UtcNow
                };
                ticket.Messages.Add(message);
            }

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new {
                ticket.Id,
                ticket.Title,
                ticket.Status,
                ticket.CustomerName,
                ticket.IsComplaint,
                ticket.CreatedAt,
                ticket.UpdatedAt
            });
        }

        public class SendMessageDto
        {
            public Guid ticketId { get; set; }
            public string? text { get; set; }
            public string? messageType { get; set; }
            public IFormFile? attachment { get; set; }
            public Guid? replyToMessageId { get; set; }
            public string? senderRole { get; set; }
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromForm] SendMessageDto dto)
        {
            var ticket = await _context.SupportTickets.FindAsync(dto.ticketId);
            if (ticket == null) return NotFound("Ticket not found");

            var actualSender = string.IsNullOrWhiteSpace(dto.senderRole) ? "Customer" : dto.senderRole;

            var message = new SupportMessage
            {
                Id = Guid.NewGuid(),
                SupportTicketId = dto.ticketId,
                Sender = actualSender,
                Text = dto.text ?? string.Empty,
                MessageType = dto.messageType ?? "Text",
                ReplyToMessageId = dto.replyToMessageId,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.attachment != null && dto.attachment.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "support");
                Directory.CreateDirectory(uploadsFolder);
                var uniqueName = Guid.NewGuid().ToString() + "_" + dto.attachment.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.attachment.CopyToAsync(stream);
                }

                message.AttachmentUrl = "/uploads/support/" + uniqueName;
                message.AttachmentName = dto.attachment.FileName;
            }

            _context.SupportMessages.Add(message);
            ticket.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // If sender is Restaurant/Staff and ticket is linked to Telegram, send reply to customer's Telegram bot
            if (actualSender != "Customer" && ticket.TelegramChatId.HasValue)
            {
                try
                {
                    var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == ticket.TenantId);
                    if (tenant != null && !string.IsNullOrEmpty(tenant.TelegramBotToken))
                    {
                        var client = _httpClientFactory.CreateClient();
                        var sendUrl = $"https://api.telegram.org/bot{tenant.TelegramBotToken}/sendMessage";
                        var msgPrefix = "👩‍💻 رد من إدارة المطعم:\n";
                        await client.PostAsJsonAsync(sendUrl, new
                        {
                            chat_id = ticket.TelegramChatId.Value,
                            text = msgPrefix + (dto.text ?? string.Empty)
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Api/SupportController] Telegram reply error: {ex.Message}");
                }
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

            await _hubContext.Clients.Group(dto.ticketId.ToString()).SendAsync("ReceiveMessage", messageDto);

            return Ok(new { success = true, message = messageDto });
        }

        [HttpPost("NotifyNewMessage/{messageId}")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous] // Internal call for prototype
        public async Task<IActionResult> NotifyNewMessage(Guid messageId)
        {
            var message = await _context.SupportMessages
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null) return NotFound("Message not found");

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

            await _hubContext.Clients.Group(message.SupportTicketId.ToString()).SendAsync("ReceiveMessage", messageDto);

            return Ok(new { success = true });
        }
    }
}
