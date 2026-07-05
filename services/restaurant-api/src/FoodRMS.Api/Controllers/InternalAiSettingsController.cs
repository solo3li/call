using Microsoft.AspNetCore.Mvc;
using FoodRMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/internal/ai-settings")]
    public class InternalAiSettingsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public InternalAiSettingsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet("{tenantId}")]
        public async Task<IActionResult> GetSettings(System.Guid tenantId)
        {
            var settings = await _context.TenantAiSettings
                .Include(s => s.VoiceProfile)
                .Include(s => s.VoiceDialect)
                .Include(s => s.VoiceEmotion)
                .Include(s => s.VoiceStyle)
                .FirstOrDefaultAsync(s => s.TenantId == tenantId);

            if (settings == null)
                return NotFound();

            return Ok(new {
                systemPrompt = settings.SystemPrompt ?? "",
                voice = settings.VoiceProfile?.Name ?? "default",
                dialect = settings.VoiceDialect?.Name ?? "standard",
                emotion = settings.VoiceEmotion?.Name ?? "neutral",
                style = settings.VoiceStyle?.Name ?? "normal",
                escalationExtension = settings.EscalationExtension ?? ""
            });
        }
        
        [HttpGet("by-extension/{extension}")]
        public async Task<IActionResult> GetSettingsByExtension(string extension)
        {
            // Assuming extension maps to TenantSipSetting
            var sipSetting = await _context.TenantSipSettings.FirstOrDefaultAsync(s => s.AgentExtension == extension);
            if (sipSetting == null) return NotFound();
            
            return await GetSettings(sipSetting.TenantId);
        }
    }
}
