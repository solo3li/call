using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Casbin;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Staff;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Infrastructure.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class StaffService : IStaffService
    {
        private readonly FoodRMSDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ITwoFactorService _twoFactorService;
        private readonly IConfiguration _configuration;
        private readonly IEnforcer _enforcer;

        public StaffService(
            FoodRMSDbContext context,
            UserManager<User> userManager,
            ITwoFactorService twoFactorService,
            IConfiguration configuration,
            IEnforcer enforcer)
        {
            _context = context;
            _userManager = userManager;
            _twoFactorService = twoFactorService;
            _configuration = configuration;
            _enforcer = enforcer;
        }

        public async Task<List<StaffDto>> GetAllAsync()
        {
            return await _context.Users
                .Where(u => u.Role != "Owner")
                .Select(u => new StaffDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Role = u.Role,
                    OrdersHandled = u.OrdersHandled,
                    Rating = u.Rating,
                    Status = u.Status,
                    Avatar = GetAvatar(u.Role),
                    EmployeeCode = u.EmployeeCode,
                    MobileNumber = u.PhoneNumber,
                    HasTotp = u.TotpSecretKey != null
                }).ToListAsync();
        }

        public async Task<StaffDto?> CreateAsync(StaffDto dto, string password)
        {
            var tenantId = _context.CurrentTenantId;
            var tenant = await _context.Tenants.Include(t => t.Plan).FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant?.Plan != null)
            {
                var currentEmployees = await _context.Users.CountAsync(u => u.Role != "Owner" && u.TenantId == tenantId);
                if (currentEmployees >= tenant.Plan.MaxEmployees)
                {
                    throw new InvalidOperationException($"You have reached the maximum number of employees ({tenant.Plan.MaxEmployees}) allowed in your plan.");
                }
            }

            var empCode = string.IsNullOrEmpty(dto.EmployeeCode) ? $"EMP{new Random().Next(1000, 9999)}" : dto.EmployeeCode;

            // Generate TOTP secret for employee
            var totpSecret = _twoFactorService.GenerateSecretKey();
            var issuer = _configuration["AppSettings:AppName"] ?? "FoodRMS";
            var fakeEmail = $"{dto.FullName.Replace(" ", "").ToLower()}_{Guid.NewGuid().ToString().Substring(0, 4)}@foodrms.local";

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = string.IsNullOrEmpty(dto.MobileNumber) ? fakeEmail : dto.MobileNumber,
                Email = fakeEmail,
                PhoneNumber = dto.MobileNumber,
                FullName = dto.FullName,
                Role = dto.Role,
                Status = dto.Status ?? "Available",
                TenantId = tenantId,
                EmployeeCode = empCode,
                TotpSecretKey = totpSecret
            };

            // Use random password since employees log in via TOTP
            var passwordToUse = string.IsNullOrEmpty(password) ? $"Emp!{Guid.NewGuid():N}" : password;
            var result = await _userManager.CreateAsync(user, passwordToUse);
            if (!result.Succeeded) return null;

            // Seed Casbin role
            await CasbinPolicySeeder.AssignUserRoleAsync(_context, _enforcer, user.Id.ToString(), dto.Role, tenantId.ToString());

            dto.Id = user.Id;
            dto.Avatar = GetAvatar(user.Role);
            dto.EmployeeCode = user.EmployeeCode;
            dto.HasTotp = true;
            // Return QR code for the manager to hand off to the employee
            dto.QrCodeDataUri = _twoFactorService.GetQrCodeDataUri(dto.MobileNumber ?? fakeEmail, totpSecret, issuer);
            return dto;
        }

        public async Task<StaffDto?> UpdateAsync(Guid id, StaffDto dto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return null;

            user.FullName = dto.FullName;
            user.Role = dto.Role;
            user.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.EmployeeCode)) user.EmployeeCode = dto.EmployeeCode;
            if (!string.IsNullOrEmpty(dto.MobileNumber)) {
                user.PhoneNumber = dto.MobileNumber;
                user.UserName = dto.MobileNumber;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return null;

            dto.Avatar = GetAvatar(user.Role);
            dto.EmployeeCode = user.EmployeeCode;
            dto.HasTotp = !string.IsNullOrEmpty(user.TotpSecretKey);
            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        private static string GetAvatar(string role)
        {
            return role switch
            {
                "Chief" => "👨‍🍳",
                "Barista" => "👩‍🍳",
                "Waiter" => "🧑‍💼",
                "Cashier" => "👩‍💻",
                _ => "👤"
            };
        }
    }
}
