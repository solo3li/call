using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using FoodRMS.Api.Data;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/hq/call-records")]
    public class HqCallRecordsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public HqCallRecordsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCallRecords(
            [FromQuery] string? tenantId = null,
            [FromQuery] string? handledBy = null, // "ai", "human", or null for all
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.CallRecords
                .Include(c => c.Tenant)
                .AsQueryable();

            if (!string.IsNullOrEmpty(tenantId) && System.Guid.TryParse(tenantId, out var tId))
            {
                query = query.Where(c => c.TenantId == tId);
            }

            if (handledBy == "ai")
                query = query.Where(c => c.HandledByAi);
            else if (handledBy == "human")
                query = query.Where(c => !c.HandledByAi);

            var total = await query.CountAsync();

            var records = await query
                .OrderByDescending(c => c.CallStartTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id,
                    c.CallerNumber,
                    c.CallStartTime,
                    c.DurationSeconds,
                    c.RecordingUrl,
                    c.HandledByAi,
                    c.TransferredToHuman,
                    TenantName = c.Tenant != null ? c.Tenant.Name : "",
                    TenantId = c.TenantId
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, records });
        }
    }
}
