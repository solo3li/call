using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Dashboard;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Dashboard
{
    public class DashboardControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public DashboardControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        private async Task<HttpClient> GetAuthenticatedClientAsync()
        {
            var client = _factory.CreateClient();
            var token = await TestAuthHelper.GetTokenAsync(client);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId);
            client.DefaultRequestHeaders.Host = $"{TenantId}.foodrms.local";
            return client;
        }

        [Fact]
        public async Task GetStats_ReturnsOk()
        {
            // Arrange
            var client = await GetAuthenticatedClientAsync();

            // Act
            var response = await client.GetAsync("/api/dashboard/stats");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<DashboardStatsDto>();
            result.Should().NotBeNull();
        }
    }
}
