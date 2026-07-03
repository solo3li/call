using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Jose;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});
var app = builder.Build();

app.UseCors();

var apiKey = Environment.GetEnvironmentVariable("LIVEKIT_API_KEY") ?? "devkey";
var apiSecret = Environment.GetEnvironmentVariable("LIVEKIT_API_SECRET") ?? "devsecret";

app.MapGet("/api/token", ([FromQuery] string room, [FromQuery] string participantName) =>
{
    if (string.IsNullOrEmpty(room) || string.IsNullOrEmpty(participantName))
        return Results.BadRequest(new { error = "room and participantName are required" });

    var payload = new Dictionary<string, object>
    {
        { "iss", apiKey },
        { "sub", participantName },
        { "nbf", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
        { "exp", DateTimeOffset.UtcNow.AddHours(2).ToUnixTimeSeconds() },
        { "video", new { roomJoin = true, room = room } },
        { "name", participantName }
    };

    var token = JWT.Encode(payload, Encoding.UTF8.GetBytes(apiSecret), JwsAlgorithm.HS256);

    return Results.Ok(new { token });
});

app.Run();
