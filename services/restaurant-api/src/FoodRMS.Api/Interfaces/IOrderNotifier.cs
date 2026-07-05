using System.Threading.Tasks;

namespace FoodRMS.Api.Interfaces
{
    public interface IOrderNotifier
    {
        Task NotifyNewOrderAsync(string tenantId, object order);
    }
}
