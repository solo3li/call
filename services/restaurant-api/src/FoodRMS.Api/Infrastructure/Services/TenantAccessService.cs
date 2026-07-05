using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class TenantAccessService : ITenantAccessService
    {
        public bool IsUserInTenant(ClaimsPrincipal user, Guid tenantId)
        {
            if (user?.Identity?.IsAuthenticated != true)
            {
                return false;
            }

            // Look for tenantId claim
            var userTenantIdClaim = user.Claims.FirstOrDefault(c => 
                (c.Type.Equals("tenantId", StringComparison.OrdinalIgnoreCase) || 
                 c.Type.Equals("tenant_id", StringComparison.OrdinalIgnoreCase)) &&
                c.Value.Equals(tenantId.ToString(), StringComparison.OrdinalIgnoreCase))?.Value;

            if (userTenantIdClaim == null)
            {
                // Fallback: search all claims for the tenantId value
                return user.Claims.Any(c => c.Value.Equals(tenantId.ToString(), StringComparison.OrdinalIgnoreCase));
            }

            return true;
        }
    }
}
