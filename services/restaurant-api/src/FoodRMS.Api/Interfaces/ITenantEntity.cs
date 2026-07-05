using System;

namespace FoodRMS.Api.Interfaces
{
    public interface ITenantEntity
    {
        Guid TenantId { get; set; }
    }
}
