using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Menu;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Menu
{
    public class MenuControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;

        public MenuControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GetCategories_Authenticated_ReturnsOk()
        {
            // Arrange
            var tenantId = "550e8400-e29b-41d4-a716-446655440000";
            var client = _factory.CreateClient();
            
            var token = await TestAuthHelper.GetTokenAsync(client);

            var request = new HttpRequestMessage(HttpMethod.Get, "/api/menu/categories");
            request.Headers.Host = $"{tenantId}.foodrms.local";
            request.Headers.Add("X-Tenant-Id", tenantId);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<MenuCategoryDto>>();
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetCategories_WrongTenantSubdomain_ReturnsForbidden()
        {
            // Arrange
            var tenantId = "550e8400-e29b-41d4-a716-446655440000";
            var wrongTenantId = Guid.NewGuid().ToString();
            var client = _factory.CreateClient();
            
            var token = await TestAuthHelper.GetTokenAsync(client);

            var request = new HttpRequestMessage(HttpMethod.Get, "/api/menu/categories");
            request.Headers.Host = $"{wrongTenantId}.foodrms.local";
            request.Headers.Add("X-Tenant-Id", wrongTenantId);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task CreateCategory_Authenticated_ReturnsOk()
        {
            var tenantId = "550e8400-e29b-41d4-a716-446655440000";
            var client = _factory.CreateClient();
            var token = await TestAuthHelper.GetTokenAsync(client);

            var category = new MenuCategoryDto { Name = "Test Category", Icon = "test-icon" };
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId);
            client.DefaultRequestHeaders.Host = $"{tenantId}.foodrms.local";

            var response = await client.PostAsJsonAsync("/api/menu/categories", category);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<MenuCategoryDto>();
            result.Should().NotBeNull();
            result!.Name.Should().Be("Test Category");
        }

        [Fact]
        public async Task GetItems_ReturnsOk()
        {
            var tenantId = "550e8400-e29b-41d4-a716-446655440000";
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId);
            client.DefaultRequestHeaders.Host = $"{tenantId}.foodrms.local";

            var response = await client.GetAsync("/api/menu/items");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task CreateItem_Authenticated_ReturnsOk()
        {
            var tenantId = "550e8400-e29b-41d4-a716-446655440000";
            var client = _factory.CreateClient();
            var token = await TestAuthHelper.GetTokenAsync(client);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId);
            client.DefaultRequestHeaders.Host = $"{tenantId}.foodrms.local";

            var item = new MenuItemDto { Name = "Test Item", Price = 10.0m, CategoryId = 1 };
            var response = await client.PostAsJsonAsync("/api/menu/items", item);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
