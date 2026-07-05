using System;

namespace FoodRMS.Api.Interfaces
{
    public interface ITenantService
    {
        Guid TenantId { get; }
        void SetTenant(Guid tenantId);
    }
}
