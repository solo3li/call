using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.IO;
using System;
using System.Linq;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/internal/asterisk")]
    public class InternalAsteriskRecordingController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public InternalAsteriskRecordingController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpPost("upload-recording")]
        public async Task<IActionResult> UploadRecording(
            [FromQuery] string extension,
            [FromQuery] string caller,
            [FromQuery] int ai,
            IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Assuming Asterisk sends extension. We need to find the tenant.
            // For now, if we don't have a direct map in Asterisk, we might need to hardcode or find the tenant.
            // Actually, wait! The user's SIP trunk is global. But wait, how do we know the TenantId?
            // Let's use the first active tenant for now as this is a single-tenant deployment mostly, OR we can find it via SipSettings.
            var tenantId = Guid.Empty; // Default if not found
            var sipSetting = _context.TenantSipSettings.FirstOrDefault();
            if (sipSetting != null)
            {
                tenantId = sipSetting.TenantId;
            }

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "recordings");
            
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var record = new CallRecord
            {
                TenantId = tenantId,
                CallerNumber = caller,
                CallStartTime = DateTime.UtcNow,
                DurationSeconds = 0, // We could parse this or get it from Asterisk CDR
                RecordingUrl = $"/recordings/{fileName}",
                HandledByAi = ai == 1,
                TransferredToHuman = false
            };

            _context.CallRecords.Add(record);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}
