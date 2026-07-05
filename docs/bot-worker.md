# FoodRMS — Telegram Bot Worker

## Overview

`FoodRMS.BotWorker` is a standalone **.NET BackgroundService** that acts as the Telegram bot gateway for all tenants. Each tenant can configure their own Telegram bot token, and the BotWorker polls all active bots concurrently using a single process.

The bot enables customers to **place food orders through Telegram** using natural language, powered by a local **Ollama LLM**.

---

## Architecture

```
Telegram API
     │
     │ Long polling (getUpdates, every 2s)
     ▼
FoodRMS.BotWorker
     │
     ├── ITelegramBotProcessor
     │      ├── OllamaClient (LLM: parse natural language order)
     │      └── FoodRmsApiClient (REST calls to FoodRMS.Api)
     │
     ├── MongoDB (bot session state: cart, conversation state per chat_id)
     │
     └── FoodRMS.Api (internal HTTP, Docker network)
```

---

## Project Structure

```
project/backend/src/FoodRMS.BotWorker/
├── Program.cs                    ← Service registration + startup
├── Worker.cs                     ← Main BackgroundService loop
├── FoodRMS.BotWorker.csproj
├── appsettings.json
├── Services/
│   ├── FoodRmsApiClient.cs       ← Internal API HTTP client
│   ├── ITelegramBotProcessor.cs  ← Bot message processing interface
│   ├── TelegramBotProcessor.cs   ← Main bot logic + Ollama integration
│   └── OllamaClient.cs           ← Local LLM HTTP client
└── TestBot.cs                    ← Integration test harness
```

---

## `Worker.cs` — The Polling Loop

The `Worker` runs as a .NET `BackgroundService`. Every 2 seconds:

1. **Fetches all active tenants** from `FoodRMS.Api` via `FoodRmsApiClient`
2. For each tenant with a configured bot token:
   - Calls `https://api.telegram.org/bot{token}/getUpdates?offset={lastUpdateId}`
   - Parses each `message` update
   - Calls `ITelegramBotProcessor.ProcessMessageAsync(tenantId, token, text, chatId, username)`
3. Tracks `lastUpdateId` per tenant in an in-memory `Dictionary<Guid, long>`

```csharp
var tenants = await apiClient.GetTenantsAsync();

foreach (var tenant in tenants)
{
    var url = $"https://api.telegram.org/bot{tenant.TelegramBotToken}/getUpdates?offset={offsets[tenant.Id]}";
    var response = await client.GetAsync(url, stoppingToken);
    // Parse updates and call processor...
}

await Task.Delay(2000, stoppingToken); // 2-second poll interval
```

---

## `TelegramBotProcessor` — Message Processing

The processor handles the bot conversation state machine. Each `chat_id` has a session stored in MongoDB.

### Session State Machine

```
[Start]
   │
   ├─ /start → Send welcome message + menu
   ├─ /menu  → Display menu categories + items
   ├─ /cart  → Show current cart
   ├─ /order → Confirm and place order
   ├─ /cancel → Clear cart and reset
   │
   └─ [Free text] → Send to Ollama for intent detection
         │
         ├─ Intent: "add_item" → Add to cart in MongoDB
         ├─ Intent: "view_menu" → Display menu
         ├─ Intent: "place_order" → Call FoodRMS.Api POST /orders
         └─ Intent: "unknown" → Clarification prompt
```

### Ollama LLM Integration

Natural language messages (e.g., "أريد برجر دجاج وبطاطس") are sent to a local Ollama instance:

```csharp
var prompt = $"""
    You are a restaurant order assistant for {tenantName}.
    Menu: {menuJson}
    Customer message: "{text}"
    
    Extract: intent (add_item|view_menu|place_order|cancel|unknown), 
    item name, quantity.
    Respond in JSON only.
    """;

var result = await _ollamaClient.ChatAsync(prompt);
```

### MongoDB Session

Each `chat_id` has a document in MongoDB (`FoodRMS_BotSession` database):

```json
{
  "chatId": 123456789,
  "tenantId": "...",
  "username": "customer_handle",
  "cart": [
    { "menuItemId": "...", "name": "Chicken Burger", "quantity": 2, "price": 35.00 }
  ],
  "state": "ordering",
  "lastActivity": "2026-05-31T18:00:00Z"
}
```

---

## `FoodRmsApiClient`

Internal HTTP client that calls `FoodRMS.Api` on the Docker network:

```csharp
// Config: FoodRmsApi__BaseUrl=http://backend:5109
public class FoodRmsApiClient
{
    // Gets all tenants with active bot tokens
    public Task<List<TenantDto>> GetTenantsAsync();
    
    // Gets menu for a specific tenant
    public Task<List<MenuCategoryDto>> GetMenuAsync(Guid tenantId);
    
    // Places an order on behalf of a customer
    public Task<OrderDto> PlaceOrderAsync(Guid tenantId, CreateOrderDto order);
}
```

Authentication between BotWorker and the API uses a service account token configured in the environment.

---

## Configuration

```json
// appsettings.json
{
  "Ollama": {
    "Url": "http://ollama:11434/api/chat",
    "Model": "llama3"
  },
  "FoodRmsApi": {
    "BaseUrl": "http://backend:5109"
  },
  "MongoDbSettings": {
    "ConnectionString": "mongodb://mongodb:27017",
    "DatabaseName": "FoodRMS_BotSession"
  }
}
```

---

## Environment Variables (Docker)

```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Development
  - ConnectionStrings__DefaultConnection=Host=db;Database=foodrms;...
  - Ollama__Url=http://ollama:11434/api/chat
  - FoodRmsApi__BaseUrl=http://backend:5109
  - MongoDbSettings__ConnectionString=mongodb://mongodb:27017
  - MongoDbSettings__DatabaseName=FoodRMS_BotSession
```

---

## Telegram Bot Setup (Per Tenant)

1. Owner creates a new bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Copies the bot token into FoodRMS Tenant Settings (`/api/tenant-settings/telegram-bot`)
3. Activates the bot via the API (`POST /api/tenant-settings/telegram-bot/activate`)
4. BotWorker automatically picks up the new token on the next poll cycle
5. Bot status tracked on `Tenant.TelegramBotStatus`: `Inactive` → `Active` (or `Error`)

---

## Bot Commands Reference

| Command | Response |
|---------|----------|
| `/start` | Welcome message, restaurant name, "ابدأ الطلب" |
| `/menu` | Formatted menu by category |
| `/cart` | Current items in cart with total |
| `/order` | Confirm and place order → returns order number |
| `/cancel` | Clear cart, start over |
| `/status` | Check status of last order |
| `/help` | Command list |

---

## Scaling Considerations

The current design uses a single BotWorker process for all tenants. This is suitable for small-to-medium deployments (< 100 active bots). For large-scale deployments, consider:

- Sharding BotWorker instances by tenant ranges
- Replacing long polling with Telegram Webhooks (reduces latency to ~0ms)
- Moving session state to Redis for distributed access

The `BotIntegrationController.cs` in `FoodRMS.Api` already includes a webhook receiver endpoint for future webhook mode.
