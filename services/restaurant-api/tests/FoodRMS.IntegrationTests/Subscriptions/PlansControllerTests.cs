using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Plans;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Subscriptions
{
    public class PlansControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;

        public PlansControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        private async Task<HttpClient> GetAuthenticatedClientAsync()
        {
            var client = _factory.CreateClient();
            var token = await TestAuthHelper.GetTokenAsync(client);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/plans");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<PlanDto>>();
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task Create_ReturnsCreated()
        {
            var client = await GetAuthenticatedClientAsync();
            var plan = new PlanDto
            {
                Name = "Test Plan",
                Price = 99.99m,
                MaxBranches = 5,
                MaxEmployees = 20,
                IsCustom = false
            };

            var response = await client.PostAsJsonAsync("/api/plans", plan);
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var result = await response.Content.ReadFromJsonAsync<PlanDto>();
            result.Should().NotBeNull();
            result!.Name.Should().Be(plan.Name);
            result.Id.Should().NotBeEmpty();
        }

        [Fact]
        public async Task GetById_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            
            // Create a plan first
            var plan = new PlanDto
            {
                Name = "Plan to Get",
                Price = 50m,
                MaxBranches = 2,
                MaxEmployees = 10
            };
            var createResponse = await client.PostAsJsonAsync("/api/plans", plan);
            var createdPlan = await createResponse.Content.ReadFromJsonAsync<PlanDto>();

            var response = await client.GetAsync($"/api/plans/{createdPlan!.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<PlanDto>();
            result.Should().NotBeNull();
            result!.Id.Should().Be(createdPlan.Id);
        }

        [Fact]
        public async Task Update_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            
            // Create a plan first
            var plan = new PlanDto
            {
                Name = "Plan to Update",
                Price = 50m,
                MaxBranches = 2,
                MaxEmployees = 10
            };
            var createResponse = await client.PostAsJsonAsync("/api/plans", plan);
            var createdPlan = await createResponse.Content.ReadFromJsonAsync<PlanDto>();

            createdPlan!.Name = "Updated Plan Name";
            var response = await client.PutAsJsonAsync($"/api/plans/{createdPlan.Id}", createdPlan);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var result = await response.Content.ReadFromJsonAsync<PlanDto>();
            result!.Name.Should().Be("Updated Plan Name");
        }

        [Fact]
        public async Task Delete_ReturnsNoContent()
        {
            var client = await GetAuthenticatedClientAsync();
            
            // Create a plan first
            var plan = new PlanDto
            {
                Name = "Plan to Delete",
                Price = 50m,
                MaxBranches = 2,
                MaxEmployees = 10
            };
            var createResponse = await client.PostAsJsonAsync("/api/plans", plan);
            var createdPlan = await createResponse.Content.ReadFromJsonAsync<PlanDto>();

            var response = await client.DeleteAsync($"/api/plans/{createdPlan!.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var getResponse = await client.GetAsync($"/api/plans/{createdPlan.Id}");
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
