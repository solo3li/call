using System;
using System.Security.Claims;

namespace FoodRMS.Api.Interfaces
{
    public interface ITenantAccessService
    {
        bool IsUserInTenant(ClaimsPrincipal user, Guid tenantId);
    }
}
