using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using FoodRMS.BotWorker.Services;
using DotNetEnv;

namespace FoodRMS.BotWorker
{
    public class TestBot
    {
        public static async Task RunAsync()
        {
            Env.Load();
            var builder = Host.CreateApplicationBuilder();

            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<MongoSessionStore>();
            builder.Services.AddScoped<FoodRmsApiClient>();
            builder.Services.AddScoped<ITelegramBotProcessor, TelegramBotProcessor>();

            var envMongo = Environment.GetEnvironmentVariable("MongoDbSettings__ConnectionString");
            var envOpenRouter = Environment.GetEnvironmentVariable("OpenRouter__ApiKey");
            var envBackend = Environment.GetEnvironmentVariable("FoodRmsApi__BaseUrl");

            // Mock configuration
            builder.Configuration["BotWorker:ApiSecret"] = "this_is_a_secure_internal_secret_key_123";
            builder.Configuration["FoodRmsApi:BaseUrl"] = envBackend ?? "http://localhost:5109";
            builder.Configuration["MongoDbSettings:ConnectionString"] = envMongo ?? "mongodb://localhost:27017";
            builder.Configuration["MongoDbSettings:DatabaseName"] = "FoodRMS_BotSession_Test";
            builder.Configuration["OpenRouter:ApiKey"] = envOpenRouter ?? throw new Exception("OpenRouter API Key is missing");

            var host = builder.Build();
            using var scope = host.Services.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<ITelegramBotProcessor>();

            Guid tenantId = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
            string token = "dummy_token";
            long chatId = 123456789;
            string username = "test_user";

            Console.WriteLine("\n--- Starting Test Scenario 1: Say Hello ---");
            await processor.ProcessMessageAsync(tenantId, token, "مرحبا، هل المطعم مفتوح؟ وماذا يوجد في المنيو؟", chatId, username);
            
            Console.WriteLine("\n--- Starting Test Scenario 2: Add to cart ---");
            await processor.ProcessMessageAsync(tenantId, token, "أريد طلب واحد وجبات رئيسية 1", chatId, username);

            Console.WriteLine("\n--- Starting Test Scenario 3: View Cart ---");
            await processor.ProcessMessageAsync(tenantId, token, "تفاصيل الطلب كامل", chatId, username);

            Console.WriteLine("\n--- Starting Test Scenario 4: Checkout ---");
            await processor.ProcessMessageAsync(tenantId, token, "اعتمد الطلب، العنوان: الرياض حي العقيق", chatId, username);

            Console.WriteLine("\n--- Starting Test Scenario 5: Check Status ---");
            await processor.ProcessMessageAsync(tenantId, token, "أين وصل طلبي؟", chatId, username);

            Console.WriteLine("\n--- Test Finished ---");
        }
    }

    public class MockTelegramBotProcessor : TelegramBotProcessor
    {
        public MockTelegramBotProcessor(
            FoodRmsApiClient apiClient,
            MongoSessionStore sessionStore,
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            Microsoft.Extensions.Logging.ILogger<TelegramBotProcessor> logger) 
            : base(apiClient, sessionStore, httpClientFactory, config, logger)
        {
        }

        protected override Task<GeminiBotResponse?> CallGeminiAsync(string systemPrompt, string userMessage, BotSession session)
        {
            var response = new GeminiBotResponse();
            if (userMessage.Contains("المنيو"))
            {
                response.Reply = "المطعم مفتوح. لدينا برجر وبطاطس.";
                response.Action = "NONE";
                session.CurrentState = "BROWSING_MENU";
            }
            else if (userMessage.Contains("برجر"))
            {
                // Assuming Burger ID is 1. Wait, let's just use a real ID if needed. Let's just pass whatever.
                // But we don't know the ID! The API returned MenuItems array. Let's assume ID 1.
                response.Reply = "تم إضافة برجر للسلة.";
                response.Action = "ADD_TO_CART";
                response.AddedItems = new List<int> { 1 };
            }
            else if (userMessage.Contains("سلتي"))
            {
                response.Reply = "سلتك تحتوي على 1 برجر.";
                response.Action = "VIEW_CART";
            }
            else if (userMessage.Contains("اعتمد الطلب"))
            {
                response.Reply = "تم اعتماد طلبك وجاري التحضير.";
                response.Action = "CREATE_ORDER";
                response.Address = "الرياض حي العقيق";
                response.Phone = "0500000000";
            }
            else if (userMessage.Contains("أين وصل"))
            {
                response.Reply = "طلبك قيد التحضير.";
                response.Action = "CHECK_STATUS";
            }
            else
            {
                response.Reply = "لم أفهم.";
                response.Action = "NONE";
            }
            return Task.FromResult<GeminiBotResponse?>(response);
        }
    }
}
