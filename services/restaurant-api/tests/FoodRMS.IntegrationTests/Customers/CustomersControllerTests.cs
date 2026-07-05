using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Customers;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Customers
{
    public class CustomersControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public CustomersControllerTests(CustomWebApplicationFactory<Program> factory)
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
        public async Task GetAll_ReturnsOk()
        {
            // Arrange
            var client = await GetAuthenticatedClientAsync();

            // Act
            var response = await client.GetAsync("/api/customers");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<CustomerDto>>();
            result.Should().NotBeNull();
            result.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Create_ReturnsCreated()
        {
            // Arrange
            var client = await GetAuthenticatedClientAsync();
            var newCustomer = new CustomerDto
            {
                Name = "Test Customer",
                PhoneNumber = "1234567890"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/customers", newCustomer);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<CustomerDto>();
            result.Should().NotBeNull();
            result!.Name.Should().Be(newCustomer.Name);
        }
    }
}
