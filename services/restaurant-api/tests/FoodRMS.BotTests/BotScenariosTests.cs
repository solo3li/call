using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using System.Text.RegularExpressions;

namespace FoodRMS.BotTests
{
    public class BotScenariosTests
    {
        [Fact]
        public async Task Test_100_Scenarios()
        {
            // Setup In-Memory DB
            var options = new DbContextOptionsBuilder<FoodRMSDbContext>()
                .UseInMemoryDatabase(databaseName: "BotTestDb_" + Guid.NewGuid().ToString())
                .Options;

            var tenantId = Guid.NewGuid();

            using var context = new FoodRMSDbContext(options);
            context.Tenants.Add(new Tenant { Id = tenantId, Name = "Test Restaurant", BaseCurrency = "SAR" });
            
            // Add some test menu items
            context.MenuCategories.Add(new MenuCategory { Id = 1, TenantId = tenantId, Name = "Burgers", Icon = "🍔" });
            context.MenuItems.Add(new MenuItem { Id = 1, TenantId = tenantId, CategoryId = 1, Name = "برجر لحم", Price = 25, IsAvailable = true });
            context.MenuItems.Add(new MenuItem { Id = 2, TenantId = tenantId, CategoryId = 1, Name = "برجر دجاج", Price = 20, IsAvailable = true });
            context.MenuItems.Add(new MenuItem { Id = 3, TenantId = tenantId, CategoryId = 1, Name = "بيتزا خضار", Price = 30, IsAvailable = true });
            await context.SaveChangesAsync();

            // Mock dependencies
            var mockNotifier = new Mock<IOrderNotifier>();
            var mockHttpClientFactory = new Mock<IHttpClientFactory>();

            // When HttpClient is requested, return a mock client that simulates Gemini 
            // returning a JSON response.
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<System.Threading.CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Content = new StringContent(@"
                    {
                        ""candidates"": [
                            {
                                ""content"": {
                                    ""parts"": [
                                        { ""text"": ""```json\n{\n\""action\"": \""CHAT\"",\n\""reply\"": \""أهلاً بك!\""\n}\n```"" }
                                    ]
                                }
                            }
                        ]
                    }")
                });

            var httpClient = new HttpClient(mockHttpMessageHandler.Object);
            mockHttpClientFactory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var processor = new TelegramBotProcessor(context, mockNotifier.Object, mockHttpClientFactory.Object);

            // Read the 100 Scenarios
            var mdPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "BotScenarios.md");
            if (!File.Exists(mdPath))
            {
                // Fallback for CI/CD environments
                mdPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "BotScenarios.md");
            }

            Assert.True(File.Exists(mdPath), $"Scenarios file not found at {mdPath}");

            var lines = await File.ReadAllLinesAsync(mdPath);
            var scenarios = lines.Where(l => Regex.IsMatch(l, @"^\d+\.\s+""")).Select(l => l.Substring(l.IndexOf('"') + 1).TrimEnd('"')).ToList();

            Assert.Equal(100, scenarios.Count);

            // Execute them
            int successCount = 0;
            foreach (var text in scenarios)
            {
                try
                {
                    var response = await processor.ProcessMessageAsync(text, tenantId, "TestUser", 12345);
                    Assert.NotNull(response);
                    Assert.NotEmpty(response);
                    successCount++;
                }
                catch (Exception ex)
                {
                    // Fail if any scenario throws an unhandled exception
                    Assert.Fail($"Scenario '{text}' failed: {ex.Message}");
                }
            }

            Assert.Equal(100, successCount);
        }
    }
}
