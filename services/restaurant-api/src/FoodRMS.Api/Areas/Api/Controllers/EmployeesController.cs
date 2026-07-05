using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Casbin;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Employees;
using FoodRMS.Api.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly FoodRMSDbContext _context;
        private readonly ITwoFactorService _twoFactorService;
        private readonly ITenantService _tenantService;
        private readonly IConfiguration _configuration;
        private readonly IEnforcer _enforcer;

        public EmployeesController(
            UserManager<User> userManager,
            FoodRMSDbContext context,
            ITwoFactorService twoFactorService,
            ITenantService tenantService,
            IConfiguration configuration,
            IEnforcer enforcer)
        {
            _userManager = userManager;
            _context = context;
            _twoFactorService = twoFactorService;
            _tenantService = tenantService;
            _configuration = configuration;
            _enforcer = enforcer;
        }

        [HttpGet]
        public async Task<ActionResult<List<EmployeeDto>>> GetAll()
        {
            var users = await _userManager.Users
                .Include(u => u.Department)
                .Include(u => u.Branch)
                .ToListAsync();

            var dtos = new List<EmployeeDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                dtos.Add(new EmployeeDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    MobileNumber = user.PhoneNumber,
                    DepartmentId = user.DepartmentId,
                    DepartmentName = user.Department?.Name ?? "غير محدد",
                    BranchId = user.BranchId,
                    BranchName = user.Branch?.Name ?? "عام",
                    Roles = roles.ToList(),
                    Status = user.Status,
                    EmployeeCode = user.EmployeeCode,
                    IsDelivery = user.IsDelivery,
                    HasTotp = !string.IsNullOrEmpty(user.TotpSecretKey),
                    // QrCodeDataUri is NOT returned on GET — only on creation
                    QrCodeDataUri = null
                });
            }
            return Ok(dtos);
        }

        /// <summary>
        /// Creates a new employee. Requires the employee's email address.
        /// Returns a QR code that the manager gives to the employee to scan with FoodRMS TOTP.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MobileNumber))
                return BadRequest(new { message = "Mobile Number is required for employee TOTP provisioning." });

            // Generate TOTP secret for this employee
            var totpSecret = _twoFactorService.GenerateSecretKey();
            var issuer = _configuration["AppSettings:AppName"] ?? "FoodRMS";

            var empCode = string.IsNullOrEmpty(request.EmployeeCode)
                ? $"EMP{new Random().Next(1000, 9999)}"
                : request.EmployeeCode;

            var fakeEmail = $"{request.FullName.Replace(" ", "").ToLower()}_{Guid.NewGuid().ToString().Substring(0, 4)}@foodrms.local";
            
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = fakeEmail,
                UserName = request.MobileNumber,
                PhoneNumber = request.MobileNumber,
                DepartmentId = request.DepartmentId,
                BranchId = request.BranchId,
                Status = "Available",
                EmployeeCode = empCode,
                IsDelivery = request.IsDelivery,
                TotpSecretKey = totpSecret,
                TenantId = _tenantService.TenantId
            };

            // Employees don't use password login — set a random unguessable password
            var randomPassword = $"Emp!{Guid.NewGuid():N}";
            var result = await _userManager.CreateAsync(user, randomPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // SYNC: Add to global lookup registry for global login support
            _context.UserTenants.Add(new UserTenant 
            { 
                Email = user.UserName!.ToLower(), 
                TenantId = _tenantService.TenantId,
                TotpSecretKey = totpSecret
            });
            await _context.SaveChangesAsync();

            if (request.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, request.Roles);

                foreach (var role in request.Roles)
                {
                    await CasbinPolicySeeder.AssignUserRoleAsync(
                        _context, _enforcer,
                        user.Id.ToString(), role,
                        _tenantService.TenantId.ToString());
                }
            }
            // Generate QR code for FoodRMS TOTP setup
            var qrCodeDataUri = _twoFactorService.GetQrCodeDataUri(request.MobileNumber, totpSecret, issuer);

            return Ok(new EmployeeDto
            {
                Id = user.Id,
                FullName = user.FullName,
                MobileNumber = user.PhoneNumber,
                EmployeeCode = user.EmployeeCode,
                IsDelivery = user.IsDelivery,
                HasTotp = true,
                QrCodeDataUri = qrCodeDataUri,   // Only returned once at creation
                Roles = request.Roles
            });
        }

        [HttpPut("{id}/roles")]
        public async Task<IActionResult> UpdateRoles(Guid id, UpdateEmployeeRolesRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            user.DepartmentId = request.DepartmentId;
            user.BranchId = request.BranchId;
            await _userManager.UpdateAsync(user);

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRolesAsync(user, request.Roles);

            var tenantId = _tenantService.TenantId.ToString();
            foreach (var role in request.Roles)
            {
                await CasbinPolicySeeder.AssignUserRoleAsync(
                    _context, _enforcer, id.ToString(), role, tenantId);
            }

            return NoContent();
        }

        /// <summary>
        /// Re-generates a TOTP secret for an employee and returns a fresh QR code.
        /// Use this if the employee loses access to their Authenticator app.
        /// </summary>
        [HttpPost("{id}/regenerate-totp")]
        public async Task<ActionResult<EmployeeDto>> RegenerateTotp(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var newSecret = _twoFactorService.GenerateSecretKey();
            user.TotpSecretKey = newSecret;
            await _userManager.UpdateAsync(user);

            // SYNC: Update global lookup
            var lookup = await _context.UserTenants.FirstOrDefaultAsync(ut => ut.Email == user.UserName!.ToLower());
            if (lookup != null)
            {
                lookup.TotpSecretKey = newSecret;
                await _context.SaveChangesAsync();
            }
            else
            {
                // Failsafe: if not found, create it
                _context.UserTenants.Add(new UserTenant 
                { 
                    Email = user.UserName!.ToLower(), 
                    TenantId = user.TenantId,
                    TotpSecretKey = newSecret
                });
                await _context.SaveChangesAsync();
            }

            var issuer = _configuration["AppSettings:AppName"] ?? "FoodRMS";
            var qrCodeDataUri = _twoFactorService.GetQrCodeDataUri(user.UserName!, newSecret, issuer);

            return Ok(new EmployeeDto
            {
                Id = user.Id,
                FullName = user.FullName,
                MobileNumber = user.PhoneNumber,
                EmployeeCode = user.EmployeeCode,
                HasTotp = true,
                QrCodeDataUri = qrCodeDataUri
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // SYNC: Remove from global registry
            var lookup = await _context.UserTenants.FirstOrDefaultAsync(ut => ut.Email == user.UserName!.ToLower());
            if (lookup != null)
            {
                _context.UserTenants.Remove(lookup);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}
