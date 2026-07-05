using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Staff;
using FoodRMS.Api.Areas.Api.Controllers;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Staff
{
    public class StaffControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public StaffControllerTests(CustomWebApplicationFactory<Program> factory)
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
            var response = await client.GetAsync("/api/staff");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<StaffDto>>();
            result.Should().NotBeNull();
            result.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Create_ReturnsOk()
        {
            // Arrange
            var client = await GetAuthenticatedClientAsync();
            var request = new CreateStaffRequest
            {
                Staff = new StaffDto
                {
                    FullName = "New Staff Member",
                    Role = "Staff",
                    Status = "Available"
                },
                Password = "Password123!"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/staff", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StaffDto>();
            result.Should().NotBeNull();
            result!.FullName.Should().Be(request.Staff.FullName);
        }
    }
}
