using System.Text.Json;
using FoodRMS.BotWorker.Services;

namespace FoodRMS.BotWorker
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _config;

        public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider, IConfiguration config)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _config = config;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("FoodRMS BotWorker started at: {time}", DateTimeOffset.Now);

            var offsets = new Dictionary<Guid, long>(); // TenantId -> lastUpdateId

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var apiClient = scope.ServiceProvider.GetRequiredService<FoodRmsApiClient>();
                    var processor = scope.ServiceProvider.GetRequiredService<ITelegramBotProcessor>();
                    var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
                    var client = httpClientFactory.CreateClient();

                    var tenants = await apiClient.GetTenantsAsync();
                    if (tenants == null || !tenants.Any())
                    {
                        await Task.Delay(10000, stoppingToken);
                        continue;
                    }

                    foreach (var tenant in tenants)
                    {
                        if (!offsets.ContainsKey(tenant.Id)) offsets[tenant.Id] = 0;

                        var url = $"https://api.telegram.org/bot{tenant.TelegramBotToken}/getUpdates?offset={offsets[tenant.Id]}";
                        var response = await client.GetAsync(url, stoppingToken);
                        
                        if (!response.IsSuccessStatusCode) continue;

                        var content = await response.Content.ReadAsStringAsync(stoppingToken);
                        using var doc = JsonDocument.Parse(content);
                        if (!doc.RootElement.GetProperty("ok").GetBoolean()) continue;

                        foreach (var update in doc.RootElement.GetProperty("result").EnumerateArray())
                        {
                            var updateId = update.GetProperty("update_id").GetInt64();
                            offsets[tenant.Id] = updateId + 1;

                            if (!update.TryGetProperty("message", out var message) ||
                                !message.TryGetProperty("text", out var textElem))
                                continue;

                            var text = textElem.GetString();
                            var chat = message.GetProperty("chat");
                            var chatId = chat.GetProperty("id").GetInt64();
                            var username = chat.TryGetProperty("username", out var u) ? u.GetString() ?? "Unknown" : "Unknown";

                            if (!string.IsNullOrEmpty(text))
                            {
                                await processor.ProcessMessageAsync(tenant.Id, tenant.TelegramBotToken, text, chatId, username);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in BotWorker loop");
                }

                await Task.Delay(2000, stoppingToken); // 2 sec polling
            }
        }
    }
}
