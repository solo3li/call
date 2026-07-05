using Microsoft.AspNetCore.Mvc;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/hq/ai-settings")]
    [Authorize]
    public class AiSettingsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly ITenantService _tenantService;

        public AiSettingsController(FoodRMSDbContext context, ITenantService tenantService)
        {
            _context = context;
            _tenantService = tenantService;
        }

        [HttpGet("options")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOptions()
        {
            var dialects = await _context.VoiceDialects.OrderBy(d => d.OrderIndex).ToListAsync();
            var emotions = await _context.VoiceEmotions.OrderBy(e => e.OrderIndex).ToListAsync();
            var styles = await _context.VoiceStyles.OrderBy(s => s.OrderIndex).ToListAsync();
            var voices = await _context.VoiceProfiles.OrderBy(v => v.OrderIndex).ToListAsync();

            return Ok(new { dialects, emotions, styles, voices });
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var tenantId = _tenantService.TenantId;
            var settings = await _context.TenantAiSettings
                .Include(s => s.VoiceProfile)
                .Include(s => s.VoiceDialect)
                .Include(s => s.VoiceEmotion)
                .Include(s => s.VoiceStyle)
                .FirstOrDefaultAsync(s => s.TenantId == tenantId);

            if (settings == null)
            {
                settings = new TenantAiSetting { TenantId = tenantId };
                _context.TenantAiSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] TenantAiSetting update)
        {
            var tenantId = _tenantService.TenantId;
            var settings = await _context.TenantAiSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId);

            if (settings == null)
            {
                settings = new TenantAiSetting { TenantId = tenantId };
                _context.TenantAiSettings.Add(settings);
            }

            settings.IsAiActive = update.IsAiActive;
            settings.VoiceProfileId = update.VoiceProfileId;
            settings.VoiceDialectId = update.VoiceDialectId;
            settings.VoiceEmotionId = update.VoiceEmotionId;
            settings.VoiceStyleId = update.VoiceStyleId;
            settings.SystemPrompt = update.SystemPrompt;
            settings.EscalationExtension = update.EscalationExtension;
            settings.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(settings);
        }
    }
}
