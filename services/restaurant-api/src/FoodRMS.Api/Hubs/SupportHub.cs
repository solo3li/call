using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;

namespace FoodRMS.Api.Hubs
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class SupportHub : Hub
    {
        public async Task JoinTicketGroup(Guid ticketId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, ticketId.ToString());
        }

        public async Task LeaveTicketGroup(Guid ticketId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ticketId.ToString());
        }

        // Allows clients (like Admin JS) to push a message directly to the group
        public async Task BroadcastMessage(Guid ticketId, object message)
        {
            await Clients.Group(ticketId.ToString()).SendAsync("ReceiveMessage", message);
        }
    }
}