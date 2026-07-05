using System;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace FoodRMS.Api.Entities
{
    public class User : IdentityUser<Guid>, ITenantEntity
    {
        public string FullName { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public string Role { get; set; } = string.Empty;
        
        public Guid? BranchId { get; set; }
        public Branch? Branch { get; set; }
        
        public int OrdersHandled { get; set; }
        public double Rating { get; set; }
        public string Status { get; set; } = "Available"; // Available, Busy, Offline

        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        public string? EmployeeCode { get; set; }

        public bool IsDelivery { get; set; } = false;

        /// <summary>
        /// Base32-encoded TOTP secret key for FoodRMS TOTP.
        /// Generated when an employee is created; null for owners/managers who use password login.
        /// </summary>
        public string? TotpSecretKey { get; set; }
    }
}
