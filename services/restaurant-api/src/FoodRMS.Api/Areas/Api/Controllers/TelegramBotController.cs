using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TelegramBotController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly ITenantService _tenantService;
        private readonly IHttpClientFactory _httpClientFactory;

        public TelegramBotController(
            FoodRMSDbContext context, 
            ITenantService tenantService, 
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _tenantService = tenantService;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfig()
        {
            var tenantId = _tenantService.TenantId;
            var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) return NotFound("Tenant not found");

            return Ok(new
            {
                telegramBotToken = tenant.TelegramBotToken,
                telegramBotUsername = tenant.TelegramBotUsername,
                telegramBotStatus = tenant.TelegramBotStatus
            });
        }

        [HttpPost("config")]
        public async Task<IActionResult> UpdateConfig([FromBody] UpdateTelegramConfigRequest request)
        {
            var tenantId = _tenantService.TenantId;
            var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) return NotFound("Tenant not found");

            tenant.TelegramBotToken = request.TelegramBotToken ?? string.Empty;

            if (string.IsNullOrWhiteSpace(tenant.TelegramBotToken))
            {
                tenant.TelegramBotStatus = "Inactive";
                tenant.TelegramBotUsername = string.Empty;
                await _context.SaveChangesAsync();
                return Ok(new { success = true, status = tenant.TelegramBotStatus });
            }

            // Validate with Telegram API
            var client = _httpClientFactory.CreateClient();
            try
            {
                var response = await client.GetAsync($"https://api.telegram.org/bot{tenant.TelegramBotToken}/getMe");
                if (response.IsSuccessStatusCode)
                {
                    var getMe = await response.Content.ReadFromJsonAsync<TelegramGetMeResponse>();
                    if (getMe?.Ok == true && getMe.Result != null)
                    {
                        tenant.TelegramBotStatus = "Active";
                        tenant.TelegramBotUsername = getMe.Result.Username;
                    }
                    else
                    {
                        tenant.TelegramBotStatus = "Error";
                    }
                }
                else
                {
                    tenant.TelegramBotStatus = "Error";
                }
            }
            catch
            {
                tenant.TelegramBotStatus = "Error";
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = tenant.TelegramBotStatus == "Active", status = tenant.TelegramBotStatus, username = tenant.TelegramBotUsername });
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestConnection([FromBody] TestTelegramRequest request)
        {
            var tenantId = _tenantService.TenantId;
            var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) return NotFound("Tenant not found");

            var tokenToTest = request.TelegramBotToken;
            if (string.IsNullOrWhiteSpace(tokenToTest))
            {
                tokenToTest = tenant.TelegramBotToken;
            }

            if (string.IsNullOrWhiteSpace(tokenToTest))
            {
                return BadRequest(new { success = false, message = "لم يتم تكوين توكن البوت بعد." });
            }

            var client = _httpClientFactory.CreateClient();
            try
            {
                var response = await client.GetAsync($"https://api.telegram.org/bot{tokenToTest}/getMe");
                if (response.IsSuccessStatusCode)
                {
                    var getMe = await response.Content.ReadFromJsonAsync<TelegramGetMeResponse>();
                    if (getMe?.Ok == true && getMe.Result != null)
                    {
                        if (tokenToTest == tenant.TelegramBotToken)
                        {
                            tenant.TelegramBotStatus = "Active";
                            tenant.TelegramBotUsername = getMe.Result.Username;
                            await _context.SaveChangesAsync();
                        }

                        return Ok(new { success = true, username = getMe.Result.Username, message = $"تم الاتصال بنجاح! معرف البوت: @{getMe.Result.Username}" });
                    }
                }
                
                if (tokenToTest == tenant.TelegramBotToken)
                {
                    tenant.TelegramBotStatus = "Error";
                    await _context.SaveChangesAsync();
                }
                return BadRequest(new { success = false, message = "فشل الاتصال. يرجى التحقق من صحة التوكن." });
            }
            catch (Exception ex)
            {
                if (tokenToTest == tenant.TelegramBotToken)
                {
                    tenant.TelegramBotStatus = "Error";
                    await _context.SaveChangesAsync();
                }
                return BadRequest(new { success = false, message = $"خطأ في الاتصال: {ex.Message}" });
            }
        }

        [HttpPost("simulate")]
        public IActionResult SimulateMessage([FromBody] SimulateTelegramRequest request)
        {
            return Ok(new { success = true, reply = new { text = "تم فصل الذكاء الاصطناعي إلى سيرفر مستقل (BotWorker). محاكي المحادثة متوقف حالياً، يرجى اختبار البوت والتحدث معه عبر تطبيق تليجرام الفعلي 📱." } });
        }
    }

    public class TestTelegramRequest
    {
        public string? TelegramBotToken { get; set; }
    }

    public class UpdateTelegramConfigRequest
    {
        public string? TelegramBotToken { get; set; }
    }

    public class SimulateTelegramRequest
    {
        public string? Message { get; set; }
        public string? Username { get; set; }
    }

    public class TelegramUser
    {
        [JsonPropertyName("id")] public long Id { get; set; }
        [JsonPropertyName("is_bot")] public bool IsBot { get; set; }
        [JsonPropertyName("first_name")] public string FirstName { get; set; } = string.Empty;
        [JsonPropertyName("username")] public string Username { get; set; } = string.Empty;
    }

    public class TelegramGetMeResponse
    {
        [JsonPropertyName("ok")] public bool Ok { get; set; }
        [JsonPropertyName("result")] public TelegramUser? Result { get; set; }
        [JsonPropertyName("description")] public string? Description { get; set; }
    }
}
