using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Employees;
using FoodRMS.Api.DTOs.Departments;
using FoodRMS.Api.DTOs.Roles;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Management
{
    public class ManagementControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private const string TenantId = "550e8400-e29b-41d4-a716-446655440000";

        public ManagementControllerTests(CustomWebApplicationFactory<Program> factory)
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
        public async Task GetEmployees_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/employees");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<EmployeeDto>>();
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetDepartments_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/departments");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<DepartmentDto>>();
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetRoles_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/roles");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<RoleDto>>();
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPermissions_ReturnsOk()
        {
            var client = await GetAuthenticatedClientAsync();
            var response = await client.GetAsync("/api/roles/permissions");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<List<PermissionDto>>();
            result.Should().NotBeNull();
        }
    }
}
