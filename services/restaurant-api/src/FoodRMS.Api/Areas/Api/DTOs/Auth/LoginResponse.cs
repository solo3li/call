using System;

namespace FoodRMS.Api.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public TenantDto Tenant { get; set; } = new TenantDto();
        public bool RequiresTwoFactor { get; set; }
        public string? TwoFactorToken { get; set; } // Temporary token for verification
    }

    public class TenantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string LoginUrl { get; set; } = string.Empty;
        public string CurrencyCode { get; set; } = "SAR";
        public string CurrencySymbol { get; set; } = "ر.س";
    }
}
