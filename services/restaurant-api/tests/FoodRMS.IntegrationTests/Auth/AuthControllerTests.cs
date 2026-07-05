using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Auth;
using FoodRMS.Api.Areas.Api.Controllers;
using Xunit;
using FluentAssertions;

namespace FoodRMS.IntegrationTests.Auth
{
    public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;

        public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOk()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new LoginRequest { Email = "admin@foodrms.com", Password = "Admin123!" };

            // Act
            var response = await client.PostAsJsonAsync("/api/auth/login", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            result.Should().NotBeNull();
            result!.Token.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new LoginRequest { Email = "admin@foodrms.com", Password = "WrongPassword" };

            // Act
            var response = await client.PostAsJsonAsync("/api/auth/login", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Register_ValidRequest_ReturnsOk()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new RegisterRequest
            {
                RestaurantName = "New Restaurant",
                Email = $"owner_{Guid.NewGuid()}@test.com",
                Password = "Password123!",
                FullName = "Test Owner"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task LoginEmployee_WithInvalidTotpCode_ReturnsUnauthorized()
        {
            // Arrange
            var client = _factory.CreateClient();
            // An invalid/wrong TOTP code should be rejected
            var request = new EmployeeTotpLoginRequest { TotpCode = "000000" };

            // Act
            var response = await client.PostAsJsonAsync("/api/auth/login-employee", request);

            // Assert — 000000 almost certainly won't match any valid TOTP
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task LoginEmployee_WithEmptyCode_ReturnsBadRequest()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new EmployeeTotpLoginRequest { TotpCode = "" };

            // Act
            var response = await client.PostAsJsonAsync("/api/auth/login-employee", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
