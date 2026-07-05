using System;
using System.ComponentModel.DataAnnotations;

namespace FoodRMS.Api.Entities
{
    public class UserTenant
    {
        [Key]
        public string Email { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public string? TotpSecretKey { get; set; }
    }
}
