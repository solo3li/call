using System.Net.Http.Json;

namespace FoodRMS.BotWorker.Services
{
    public class FoodRmsApiClient
    {
        private readonly HttpClient _httpClient;

        public FoodRmsApiClient(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(config["FoodRmsApi:BaseUrl"] ?? "http://localhost:5109");
            var secret = config["BotWorker:ApiSecret"] ?? "this_is_a_secure_internal_secret_key_123";
            _httpClient.DefaultRequestHeaders.Add("X-Bot-Secret", secret);
        }

        public async Task<List<TenantDto>?> GetTenantsAsync()
        {
            return await _httpClient.GetFromJsonAsync<List<TenantDto>>("/api/bot-integration/tenants");
        }

        public async Task<TenantStateDto?> GetStateAsync(Guid tenantId)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/bot-integration/state/{tenantId}");
            request.Headers.Add("X-Tenant-ID", tenantId.ToString());
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<TenantStateDto>();
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(Guid tenantId, BotOrderRequest botRequest)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"/api/bot-integration/orders/{tenantId}");
            request.Headers.Add("X-Tenant-ID", tenantId.ToString());
            request.Content = JsonContent.Create(botRequest);
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<OrderResponseDto>();
        }
        public async Task<List<OrderStatusDto>?> GetCustomerOrdersAsync(Guid tenantId, long chatId)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/bot-integration/orders/{tenantId}/{chatId}");
            request.Headers.Add("X-Tenant-ID", tenantId.ToString());
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<OrderStatusDto>>();
        }
    }

    public record TenantDto(Guid Id, string TelegramBotToken);
    public record TenantStateDto(bool IsStoreOpen, string CurrencySymbol, List<MenuItemDto> MenuItems);
    public record MenuItemDto(int Id, string Name, string Description, decimal Price, string CategoryName);
    public record BotOrderRequest(long ChatId, string Username, string Address, string Phone, List<int> MenuItemIds, decimal TotalAmount);
    public record OrderResponseDto(Guid Id, string OrderNumber);
    public record OrderStatusDto(Guid Id, string OrderNumber, string Status, decimal TotalAmount, DateTime CreatedAt);
}
