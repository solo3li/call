using FoodRMS.BotWorker;
using FoodRMS.BotWorker.Services;
using DotNetEnv;

Env.Load();

if (args.Contains("--test"))
{
    Console.WriteLine("Running FoodRMS BotWorker scenario tests...");
    await TestBot.RunAsync();
    return;
}

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddSingleton<MongoSessionStore>();
builder.Services.AddScoped<FoodRmsApiClient>();
builder.Services.AddScoped<ITelegramBotProcessor, TelegramBotProcessor>();
builder.Services.AddHostedService<Worker>();

var host = builder.Build();

host.Run();
