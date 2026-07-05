using Microsoft.AspNetCore.Mvc;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/hq/sip-settings")]
    [Authorize]
    public class SipSettingsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly ITenantService _tenantService;

        public SipSettingsController(FoodRMSDbContext context, ITenantService tenantService)
        {
            _context = context;
            _tenantService = tenantService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var tenantId = _tenantService.TenantId;
            var settings = await _context.TenantSipSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId);

            if (settings == null)
            {
                settings = new TenantSipSetting 
                { 
                    TenantId = tenantId,
                    AgentExtension = "101", // Default generated extension for first user
                    AgentPassword = System.Guid.NewGuid().ToString().Substring(0, 8)
                };
                _context.TenantSipSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] TenantSipSetting update)
        {
            var tenantId = _tenantService.TenantId;
            var settings = await _context.TenantSipSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId);

            if (settings == null)
            {
                settings = new TenantSipSetting 
                { 
                    TenantId = tenantId,
                    AgentExtension = "101",
                    AgentPassword = System.Guid.NewGuid().ToString().Substring(0, 8)
                };
                _context.TenantSipSettings.Add(settings);
            }

            settings.TrunkHost = update.TrunkHost;
            settings.TrunkUsername = update.TrunkUsername;
            settings.TrunkPassword = update.TrunkPassword;
            settings.TrunkPort = update.TrunkPort;
            settings.MaxChannels = update.MaxChannels;
            settings.DidNumber = update.DidNumber;
            settings.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(settings);
        }
    }
}
