using System;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class TenantService : ITenantService
    {
        public Guid TenantId { get; private set; }

        public void SetTenant(Guid tenantId)
        {
            TenantId = tenantId;
        }
    }
}
