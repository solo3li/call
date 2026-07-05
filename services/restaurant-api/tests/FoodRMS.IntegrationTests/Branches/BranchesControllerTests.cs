using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Branches;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Branches
{
    public class BranchesControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public BranchesControllerTests(CustomWebApplicationFactory<Program> factory)
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
            var response = await client.GetAsync("/api/branches");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<BranchDto>>();
            result.Should().NotBeNull();
            result.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Create_ReturnsCreated()
        {
            // Arrange
            var client = await GetAuthenticatedClientAsync();
            var newBranch = new BranchDto
            {
                Name = "New Test Branch",
                Address = "Test Address",
                Status = "Open",
                Rating = 5.0
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/branches", newBranch);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<BranchDto>();
            result.Should().NotBeNull();
            result!.Name.Should().Be(newBranch.Name);
        }

        [Fact]
        public async Task Update_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var branches = await client.GetFromJsonAsync<List<BranchDto>>("/api/branches");
            var branch = branches![0];
            branch.Name = "Updated Branch Name";

            var response = await client.PutAsJsonAsync($"/api/branches/{branch.Id}", branch);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<BranchDto>();
            result!.Name.Should().Be("Updated Branch Name");
        }

        [Fact]
        public async Task Delete_ReturnsNoContent()
        {
            var client = await GetAuthenticatedClientAsync();
            var newBranch = new BranchDto { Name = "Branch to Delete", Address = "Test Address", Status = "Open" };
            var createResponse = await client.PostAsJsonAsync("/api/branches", newBranch);
            var createdBranch = await createResponse.Content.ReadFromJsonAsync<BranchDto>();

            var response = await client.DeleteAsync($"/api/branches/{createdBranch!.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }
    }
}
