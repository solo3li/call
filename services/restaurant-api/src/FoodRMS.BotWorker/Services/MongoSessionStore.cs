using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FoodRMS.BotWorker.Services
{
    public class BotSession
    {
        [BsonId]
        public string Id { get; set; } = string.Empty; // e.g. "ChatId_TenantId"
        public long ChatId { get; set; }
        public Guid TenantId { get; set; }
        public string CurrentState { get; set; } = "IDLE";
        public List<int> PendingOrderItemIds { get; set; } = new();
        public string LastPrompt { get; set; } = string.Empty;
        public string CurrentMenuContext { get; set; } = string.Empty;
        public string PendingOrderContext { get; set; } = string.Empty;
        public DateTime LastInteraction { get; set; } = DateTime.UtcNow;

        // Chat History for memory
        public List<ChatMessage> ChatHistory { get; set; } = new();
    }

    public class ChatMessage
    {
        public string Role { get; set; } = "user"; // user, model, system
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class MongoSessionStore
    {
        private readonly IMongoCollection<BotSession> _sessions;
        private readonly ILogger<MongoSessionStore> _logger;

        static MongoSessionStore()
        {
            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
        }

        public MongoSessionStore(IConfiguration config, ILogger<MongoSessionStore> logger)
        {
            _logger = logger;
            var connectionString = config["MongoDbSettings:ConnectionString"] ?? "mongodb://localhost:27017";
            var databaseName = config["MongoDbSettings:DatabaseName"] ?? "FoodRMS_BotSession";

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _sessions = database.GetCollection<BotSession>("Sessions");
        }

        public async Task<BotSession> GetOrCreateSessionAsync(long chatId, Guid tenantId)
        {
            var id = $"{chatId}_{tenantId}";
            var session = await _sessions.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (session == null)
            {
                session = new BotSession { Id = id, ChatId = chatId, TenantId = tenantId };
                await _sessions.InsertOneAsync(session);
            }
            return session;
        }

        public async Task UpdateSessionAsync(BotSession session)
        {
            session.LastInteraction = DateTime.UtcNow;
            await _sessions.ReplaceOneAsync(s => s.Id == session.Id, session, new ReplaceOptions { IsUpsert = true });
        }

        public async Task AddMessageToHistoryAsync(BotSession session, string role, string text)
        {
            session.ChatHistory.Add(new ChatMessage { Role = role, Text = text });
            
            // Keep only last 10 messages for context
            if (session.ChatHistory.Count > 10)
            {
                session.ChatHistory = session.ChatHistory.Skip(session.ChatHistory.Count - 10).ToList();
            }
            await UpdateSessionAsync(session);
        }
    }
}
