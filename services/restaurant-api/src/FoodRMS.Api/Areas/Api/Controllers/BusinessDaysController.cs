using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessDaysController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly ITenantService _tenantService;

        public BusinessDaysController(FoodRMSDbContext context, ITenantService tenantService)
        {
            _context = context;
            _tenantService = tenantService;
        }

        [HttpGet("active")]
        public async Task<ActionResult<object>> GetActiveDay()
        {
            var activeDay = await _context.BusinessDays
                .OrderByDescending(b => b.StartedAt)
                .FirstOrDefaultAsync(b => b.EndedAt == null);

            if (activeDay == null)
            {
                return Ok(new { isActive = false });
            }

            return Ok(new { 
                isActive = true, 
                businessDay = activeDay 
            });
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartDay()
        {
            var activeDay = await _context.BusinessDays
                .FirstOrDefaultAsync(b => b.EndedAt == null);

            if (activeDay != null)
                return BadRequest("A business day is already active.");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? staffId = null;
            if (Guid.TryParse(userIdStr, out var sId)) staffId = sId;

            var newDay = new BusinessDay
            {
                StartedAt = DateTime.UtcNow,
                StartedByUserId = staffId,
                TenantId = _tenantService.TenantId
            };

            _context.BusinessDays.Add(newDay);
            await _context.SaveChangesAsync();

            return Ok(newDay);
        }

        [HttpPost("end")]
        public async Task<IActionResult> EndDay()
        {
            var activeDay = await _context.BusinessDays
                .FirstOrDefaultAsync(b => b.EndedAt == null);

            if (activeDay == null)
                return BadRequest("No active business day found.");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? staffId = null;
            if (Guid.TryParse(userIdStr, out var sId)) staffId = sId;

            activeDay.EndedAt = DateTime.UtcNow;
            activeDay.EndedByUserId = staffId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Business day ended successfully." });
        }
    }
}
