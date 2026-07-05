using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace FoodRMS.Api.Data
{
    public class TenantModelCacheKeyFactory : IModelCacheKeyFactory
    {
        public object Create(DbContext context, bool designTime)
        {
            if (context is FoodRMSDbContext dbContext)
            {
                return (dbContext.CurrentTenantId, designTime);
            }
            return (context.GetType(), designTime);
        }
    }
}
