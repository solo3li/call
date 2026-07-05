using System.Threading.Tasks;
using FoodRMS.Api.Hubs;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FoodRMS.Api.Services
{
    public class OrderNotifier : IOrderNotifier
    {
        private readonly IHubContext<OrderHub> _hubContext;

        public OrderNotifier(IHubContext<OrderHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyNewOrderAsync(string tenantId, object order)
        {
            await _hubContext.Clients.Group(tenantId).SendAsync("ReceiveOrderUpdate", order);
        }
    }
}
