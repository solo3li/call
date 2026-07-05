using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace FoodRMS.BotWorker.Services
{
    public interface ITelegramBotProcessor
    {
        Task ProcessMessageAsync(Guid tenantId, string token, string messageText, long chatId, string username);
    }

    public class TelegramBotProcessor : ITelegramBotProcessor
    {
        private readonly FoodRmsApiClient _apiClient;
        private readonly MongoSessionStore _sessionStore;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<TelegramBotProcessor> _logger;

        public TelegramBotProcessor(
            FoodRmsApiClient apiClient,
            MongoSessionStore sessionStore,
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<TelegramBotProcessor> logger)
        {
            _apiClient = apiClient;
            _sessionStore = sessionStore;
            _httpClientFactory = httpClientFactory;
            _config = config;
            _logger = logger;
        }

        public async Task ProcessMessageAsync(Guid tenantId, string token, string messageText, long chatId, string username)
        {
            _logger.LogInformation("Processing message from {Username} ({ChatId}): {Text}", username, chatId, messageText);

            var session = await _sessionStore.GetOrCreateSessionAsync(chatId, tenantId);
            var state = await _apiClient.GetStateAsync(tenantId);
            
            if (state == null)
            {
                await SendMessageAsync(token, chatId, "عذراً، النظام غير متاح حالياً.");
                return;
            }

            var activeOrders = await _apiClient.GetCustomerOrdersAsync(tenantId, chatId);
            var ordersContext = activeOrders != null && activeOrders.Any() 
                ? "Active Orders:\n" + string.Join("\n", activeOrders.Select(o => $"- Order #{o.OrderNumber} ({o.Status}) - Total: {o.TotalAmount}"))
                : "No active orders.";

            var menuText = string.Join("\n", state.MenuItems.Select(m => $"- {m.Id}: {m.Name} ({m.Price}{state.CurrencySymbol}): {m.Description} [{m.CategoryName}]"));
            
            var pendingItemNames = session.PendingOrderItemIds.Select(id => state.MenuItems.FirstOrDefault(m => m.Id == id)?.Name).Where(n => n != null);
            var cartContext = pendingItemNames.Any() ? string.Join(", ", pendingItemNames) : "Empty";

            var systemPrompt = $@"
You are a highly professional, polite, and advanced AI assistant for a restaurant. You speak Arabic.
Restaurant Status: {(state.IsStoreOpen ? "Open" : "Closed")}.
Currency: {state.CurrencySymbol}

Menu:
{menuText}

{ordersContext}

User's Current Cart: {cartContext}
User's Pending Item IDs: [{string.Join(",", session.PendingOrderItemIds)}]
User's last state: {session.CurrentState}

Your task is to understand the user's intent and respond with a JSON object.
Rules:
1. Always reply in Arabic.
2. If they ask about the menu, recommend items nicely.
3. If they want to order, add the EXACT menu item IDs to 'addedItems'.
4. If they want to remove items, add the EXACT menu item IDs to 'removedItems'.
5. If they want to check out, set action to 'CREATE_ORDER'.
6. If they ask about their active orders, read the Active Orders section and answer them nicely, setting action to 'CHECK_STATUS'.
7. If they ask to see their cart, list what is in their cart nicely, setting action to 'VIEW_CART'.
8. If the restaurant is Closed, inform them they cannot order but can view the menu.

Return ONLY a valid JSON object with the following structure:
{{
  ""action"": ""CHAT|BUILD_ORDER|CREATE_ORDER|SAVE_ADDRESS|CHECK_STATUS|VIEW_CART|MODIFY_CART"",
  ""reply"": ""Your Arabic response to the user"",
  ""addedItems"": [], // MUST be an array of integers ONLY (the item IDs). If the user wants quantity 3 of item 12, you MUST add 12 three times like this: [12, 12, 12]
  ""removedItems"": [], // MUST be an array of integers ONLY.
  ""address"": ""user address if provided"",
  ""phone"": ""user phone if provided""
}}
";
            
            var geminiResponse = await CallGeminiAsync(systemPrompt, messageText, session);
            if (geminiResponse == null)
            {
                await SendMessageAsync(token, chatId, "عذراً، النظام مشغول حالياً. حاول مرة أخرى لاحقاً.");
                return;
            }

            // Handle actions
            if (geminiResponse.AddedItems?.Any() == true)
                session.PendingOrderItemIds.AddRange(geminiResponse.AddedItems);
            
            if (geminiResponse.RemovedItems?.Any() == true)
            {
                foreach(var idToRemove in geminiResponse.RemovedItems)
                {
                    session.PendingOrderItemIds.Remove(idToRemove); // removes first occurrence
                }
            }

            if (!state.IsStoreOpen && (geminiResponse.Action == "BUILD_ORDER" || geminiResponse.Action == "CREATE_ORDER" || geminiResponse.Action == "MODIFY_CART"))
            {
                await SendMessageAsync(token, chatId, "عذراً، المطعم مغلق حالياً ولا يمكننا استقبال طلبات أو التعديل عليها.");
                await _sessionStore.UpdateSessionAsync(session);
                return;
            }

            if (geminiResponse.Action == "CREATE_ORDER")
            {
                if (session.PendingOrderItemIds.Count == 0)
                {
                    session.CurrentState = "IDLE";
                    await SendMessageAsync(token, chatId, "سلتك فارغة! لا يمكن إتمام الطلب.");
                }
                else if (string.IsNullOrEmpty(geminiResponse.Address))
                {
                    session.CurrentState = "WAITING_FOR_ADDRESS";
                    await SendMessageAsync(token, chatId, "يرجى تزويدي بعنوان التوصيل لتأكيد الطلب.");
                }
                else
                {
                    var total = session.PendingOrderItemIds.Sum(id => state.MenuItems.FirstOrDefault(m => m.Id == id)?.Price ?? 0);
                    var req = new BotOrderRequest(chatId, username, geminiResponse.Address, geminiResponse.Phone ?? "", session.PendingOrderItemIds, total);
                    var created = await _apiClient.CreateOrderAsync(tenantId, req);
                    session.PendingOrderItemIds.Clear();
                    session.CurrentState = "IDLE";
                    await SendMessageAsync(token, chatId, geminiResponse.Reply + $"\n\nتم استلام طلبك بنجاح! رقم الطلب: {created?.OrderNumber} 🎉");
                }
            }
            else if (geminiResponse.Action == "SAVE_ADDRESS" && session.CurrentState == "WAITING_FOR_ADDRESS")
            {
                var total = session.PendingOrderItemIds.Sum(id => state.MenuItems.FirstOrDefault(m => m.Id == id)?.Price ?? 0);
                var req = new BotOrderRequest(chatId, username, geminiResponse.Address ?? messageText, geminiResponse.Phone ?? "", session.PendingOrderItemIds, total);
                var created = await _apiClient.CreateOrderAsync(tenantId, req);
                session.PendingOrderItemIds.Clear();
                session.CurrentState = "IDLE";
                await SendMessageAsync(token, chatId, $"تم حفظ العنوان وتأكيد الطلب! رقم الطلب: {created?.OrderNumber} شكراً لك.");
            }
            else
            {
                session.CurrentState = geminiResponse.Action;
                await SendMessageAsync(token, chatId, geminiResponse.Reply);
            }

            await _sessionStore.AddMessageToHistoryAsync(session, "user", messageText);
            await _sessionStore.AddMessageToHistoryAsync(session, "model", geminiResponse.Reply);
        }

        protected virtual async Task<GeminiBotResponse?> CallGeminiAsync(string systemPrompt, string userMessage, BotSession session)
        {
            try
            {
                var openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
                var openRouterModel = "qwen/qwen3.6-plus";
                var apiKey = _config["OpenRouter:ApiKey"] ?? Environment.GetEnvironmentVariable("OpenRouter__ApiKey") ?? throw new Exception("OpenRouter API Key is missing");

                var messages = new List<object>
                {
                    new { role = "system", content = systemPrompt }
                };

                foreach (var msg in session.ChatHistory)
                {
                    string role = msg.Role == "model" ? "assistant" : msg.Role;
                    messages.Add(new { role = role, content = msg.Text });
                }

                messages.Add(new { role = "user", content = userMessage });

                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromMinutes(5);
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                var request = new
                {
                    model = openRouterModel,
                    messages = messages.ToArray(),
                    response_format = new { type = "json_object" }
                };

                var response = await client.PostAsJsonAsync(openRouterUrl, request);
                
                response.EnsureSuccessStatusCode();
                
                var jsonDoc = await response.Content.ReadFromJsonAsync<JsonDocument>();
                var text = jsonDoc?.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                
                if (text == null) return null;
                text = text.Replace("```json", "").Replace("```", "").Trim();
                
                return JsonSerializer.Deserialize<GeminiBotResponse>(text, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenRouter API error");
                return null;
            }
        }

        private async Task SendMessageAsync(string token, long chatId, string text)
        {
            if (token == "dummy_token")
            {
                Console.WriteLine($"\n[BOT to {chatId}]: {text}\n");
                return;
            }
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.telegram.org/bot{token}/sendMessage";
            await client.PostAsJsonAsync(url, new { chat_id = chatId, text = text });
        }
    }

    public class GeminiBotResponse
    {
        public string Action { get; set; } = string.Empty;
        public string Reply { get; set; } = string.Empty;
        public List<int> AddedItems { get; set; } = new();
        public List<int> RemovedItems { get; set; } = new();
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}