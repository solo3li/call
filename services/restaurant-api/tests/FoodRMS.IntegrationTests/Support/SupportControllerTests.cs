using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Support
{
    public class SupportControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public SupportControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        private async Task<HttpClient> GetAuthenticatedClientAsync()
        {
            var client = _factory.CreateClient();
            var token = await TestAuthHelper.GetTokenAsync(client);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId);
            return client;
        }

        [Fact]
        public async Task GetTicket_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/support/ticket");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var result = await response.Content.ReadFromJsonAsync<dynamic>();
            Assert.NotNull(result);
        }

        [Fact]
        public async Task SendMessage_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            
            // Get ticket first to get ID
            var getTicketResponse = await client.GetAsync("/api/support/ticket");
            getTicketResponse.EnsureSuccessStatusCode();
            var ticket = await getTicketResponse.Content.ReadFromJsonAsync<TicketResponse>();

            var content = new MultipartFormDataContent();
            content.Add(new StringContent(ticket!.Id.ToString()), "ticketId");
            content.Add(new StringContent("Hello Test"), "text");
            content.Add(new StringContent("Text"), "messageType");

            var response = await client.PostAsync("/api/support/sendmessage", content);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var result = await response.Content.ReadFromJsonAsync<dynamic>();
            Assert.NotNull(result);
        }

        private class TicketResponse
        {
            public Guid Id { get; set; }
        }
    }
}
