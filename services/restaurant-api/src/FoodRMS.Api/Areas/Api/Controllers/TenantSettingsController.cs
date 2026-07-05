using System;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TenantSettingsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;
        private readonly ITenantService _tenantService;

        public TenantSettingsController(FoodRMSDbContext context, ITenantService tenantService)
        {
            _context = context;
            _tenantService = tenantService;
        }

        public class TenantSettingsDto
        {
            public string RestaurantName { get; set; } = string.Empty;
            public Guid? CurrencyId { get; set; }
            public string CurrencyCode { get; set; } = string.Empty;
            public string CurrencySymbol { get; set; } = string.Empty;
            public bool AutoPrintExternalOrders { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var tenantId = _tenantService.TenantId;
            var tenant = await _context.Tenants.Include(t => t.Currency).FirstOrDefaultAsync(t => t.Id == tenantId);
            
            if (tenant == null) return NotFound();

            return Ok(new TenantSettingsDto
            {
                RestaurantName = tenant.Name,
                CurrencyId = tenant.CurrencyId,
                CurrencyCode = tenant.Currency?.Code ?? "SAR",
                CurrencySymbol = tenant.Currency?.Symbol ?? "ر.س",
                AutoPrintExternalOrders = tenant.AutoPrintExternalOrders
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] TenantSettingsDto request)
        {
            var tenantId = _tenantService.TenantId;
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
            
            if (tenant == null) return NotFound();

            tenant.Name = request.RestaurantName;
            tenant.CurrencyId = request.CurrencyId;
            tenant.AutoPrintExternalOrders = request.AutoPrintExternalOrders;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile([FromServices] ITwoFactorService twoFactorService)
        {
            var tenantId = _tenantService.TenantId;
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var tenant = await _context.Tenants.Include(t => t.Plan).FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) return NotFound();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            string? qrCodeDataUri = null;
            if (!string.IsNullOrEmpty(user.TotpSecretKey))
            {
                qrCodeDataUri = twoFactorService.GetQrCodeDataUri(user.Email ?? user.UserName ?? "User", user.TotpSecretKey, tenant.Name ?? "FoodRMS");
            }
            
            var branchesCount = await _context.Branches.IgnoreQueryFilters().CountAsync(b => b.TenantId == tenantId);
            var employeesCount = await _context.UserTenants.IgnoreQueryFilters().CountAsync(ut => ut.TenantId == tenantId);

            return Ok(new
            {
                UserName = user.UserName,
                Email = user.Email,
                RestaurantName = tenant.Name,
                QrCodeDataUri = qrCodeDataUri,
                Plan = tenant.Plan != null ? new 
                {
                    Name = tenant.Plan.Name,
                    MaxBranches = tenant.Plan.MaxBranches,
                    MaxEmployees = tenant.Plan.MaxEmployees
                } : null,
                Usage = new
                {
                    BranchesCount = branchesCount,
                    EmployeesCount = employeesCount
                }
            });
        }

        [HttpPost("generate-totp")]
        public async Task<IActionResult> GenerateMyTotp([FromServices] ITwoFactorService twoFactorService, [FromServices] UserManager<User> userManager)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound();

            var tenant = await _context.Tenants.FindAsync(user.TenantId);
            var schemaName = $"tenant_{user.TenantId:N}";
            
            // Generate a new TOTP secret key
            user.TotpSecretKey = twoFactorService.GenerateSecretKey();
            
            // Forcefully update AspNetUsers via SQL
            await _context.Database.ExecuteSqlRawAsync(
                $"UPDATE \"{schemaName}\".\"AspNetUsers\" SET \"TotpSecretKey\" = {{0}} WHERE \"Id\" = {{1}}",
                user.TotpSecretKey, user.Id);
            
            // Forcefully update UserTenants lookup
            if (!string.IsNullOrEmpty(user.Email))
            {
                var userEmail = user.Email.ToLower();
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE public.\"UserTenants\" SET \"TotpSecretKey\" = {0} WHERE LOWER(\"Email\") = {1}",
                    user.TotpSecretKey, userEmail);
                    
                if (rowsAffected == 0)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "INSERT INTO public.\"UserTenants\" (\"Email\", \"TenantId\", \"TotpSecretKey\") VALUES ({0}, {1}, {2})",
                        user.Email, user.TenantId, user.TotpSecretKey);
                }
            }

            var qrCodeDataUri = twoFactorService.GetQrCodeDataUri(user.Email ?? user.UserName ?? "User", user.TotpSecretKey, tenant?.Name ?? "FoodRMS");
            return Ok(new { QrCodeDataUri = qrCodeDataUri });
        }
    }
}
