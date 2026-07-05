using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace FoodRMS.Api.Hubs
{
    public class OrderHub : Hub
    {
        public async Task JoinTenantGroup(string tenantId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, tenantId);
        }

        public async Task LeaveTenantGroup(string tenantId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, tenantId);
        }
    }
}
