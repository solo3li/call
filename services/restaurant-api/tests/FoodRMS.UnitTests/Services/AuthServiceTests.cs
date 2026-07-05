using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using FluentAssertions;
using Casbin;
using FoodRMS.Api.Areas.Api.Controllers;

namespace FoodRMS.UnitTests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<FoodRMS.Api.Interfaces.ITwoFactorService> _twoFactorServiceMock;
        private readonly Mock<FoodRMS.Api.Interfaces.ITenantService> _tenantServiceMock;
        private readonly Mock<IEnforcer> _enforcerMock;
        private readonly AuthService _authService;
        private readonly FoodRMSDbContext _context;
        private Guid _currentTenantId = Guid.NewGuid();

        public AuthServiceTests()
        {
            var store = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
            _configurationMock = new Mock<IConfiguration>();
            _twoFactorServiceMock = new Mock<FoodRMS.Api.Interfaces.ITwoFactorService>();
            _tenantServiceMock = new Mock<FoodRMS.Api.Interfaces.ITenantService>();

            _tenantServiceMock.Setup(t => t.TenantId).Returns(() => _currentTenantId);
            _tenantServiceMock.Setup(t => t.SetTenant(It.IsAny<Guid>())).Callback<Guid>(id => _currentTenantId = id);

            var jwtSection = new Mock<IConfigurationSection>();
            jwtSection.Setup(s => s["Key"]).Returns("super_secret_key_that_is_long_enough_123");
            jwtSection.Setup(s => s["Issuer"]).Returns("TestIssuer");
            jwtSection.Setup(s => s["Audience"]).Returns("TestAudience");
            jwtSection.Setup(s => s["ExpiryInMinutes"]).Returns("60");

            _configurationMock.Setup(c => c.GetSection("Jwt")).Returns(jwtSection.Object);

            var options = new DbContextOptionsBuilder<FoodRMSDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _context = new FoodRMSDbContext(options, _tenantServiceMock.Object);

            _enforcerMock = new Mock<IEnforcer>();

            var serviceProviderMock = new Mock<IServiceProvider>();
            var serviceScopeMock = new Mock<Microsoft.Extensions.DependencyInjection.IServiceScope>();
            serviceScopeMock.Setup(s => s.ServiceProvider).Returns(serviceProviderMock.Object);

            var serviceScopeFactoryMock = new Mock<Microsoft.Extensions.DependencyInjection.IServiceScopeFactory>();
            serviceScopeFactoryMock.Setup(f => f.CreateScope()).Returns(serviceScopeMock.Object);

            serviceProviderMock.Setup(p => p.GetService(typeof(Microsoft.Extensions.DependencyInjection.IServiceScopeFactory))).Returns(serviceScopeFactoryMock.Object);
            serviceProviderMock.Setup(p => p.GetService(typeof(FoodRMS.Api.Interfaces.ITenantService))).Returns(_tenantServiceMock.Object);
            serviceProviderMock.Setup(p => p.GetService(typeof(FoodRMSDbContext))).Returns(_context);
            serviceProviderMock.Setup(p => p.GetService(typeof(UserManager<User>))).Returns(_userManagerMock.Object);
            serviceProviderMock.Setup(p => p.GetService(typeof(IEnforcer))).Returns(_enforcerMock.Object);

            var httpClientFactoryMock = new Mock<System.Net.Http.IHttpClientFactory>();
            _authService = new AuthService(_userManagerMock.Object, _configurationMock.Object, _context, _twoFactorServiceMock.Object, _tenantServiceMock.Object, serviceProviderMock.Object, _enforcerMock.Object, httpClientFactoryMock.Object);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsLoginResponse()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@example.com", Password = "Password123!" };
            var tenantId = Guid.NewGuid();
            _tenantServiceMock.Object.SetTenant(tenantId);

            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", NormalizedEmail = "TEST@EXAMPLE.COM", TenantId = tenantId, Role = "Owner", FullName = "Test Owner" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _userManagerMock.Setup(m => m.FindByEmailAsync(request.Email)).ReturnsAsync(user);
            _userManagerMock.Setup(m => m.CheckPasswordAsync(user, request.Password)).ReturnsAsync(true);
            _userManagerMock.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string>());

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().NotBeEmpty();
            result.Tenant.Id.Should().Be(tenantId);
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ReturnsNull()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@example.com", Password = "WrongPassword" };
            var user = new User { Email = "test@example.com", NormalizedEmail = "TEST@EXAMPLE.COM" };

            _userManagerMock.Setup(m => m.FindByEmailAsync(request.Email)).ReturnsAsync(user);
            _userManagerMock.Setup(m => m.CheckPasswordAsync(user, request.Password)).ReturnsAsync(false);

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LoginEmployeeAsync_ValidTotp_ReturnsLoginResponse()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            _tenantServiceMock.Object.SetTenant(tenantId);

            var user = new User { Id = Guid.NewGuid(), EmployeeCode = "EMP101", TotpSecretKey = "SECRET123", TenantId = tenantId, Role = "Staff", UserName = "emp@test.com", Email = "emp@test.com", NormalizedEmail = "EMP@TEST.COM", NormalizedUserName = "EMP@TEST.COM", FullName = "Test Emp" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _userManagerMock.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Staff" });
            _twoFactorServiceMock.Setup(t => t.ValidateToken("SECRET123", "482917")).Returns(true);

            // Act
            var result = await _authService.LoginEmployeeByTotpAsync("482917");

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().NotBeEmpty();
            result.Tenant.Id.Should().Be(tenantId);
        }

        [Fact]
        public async Task LoginEmployeeAsync_InvalidTotp_ReturnsNull()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            _tenantServiceMock.Object.SetTenant(tenantId);

            var user = new User { Id = Guid.NewGuid(), EmployeeCode = "EMP101", TotpSecretKey = "SECRET123", TenantId = tenantId, Role = "Staff", Email = "emp@test.com", FullName = "Test Emp" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _twoFactorServiceMock.Setup(t => t.ValidateToken("SECRET123", "999999")).Returns(false);
            // Act
            var result = await _authService.LoginEmployeeByTotpAsync("999999");

            // Assert
            result.Should().BeNull();
        }
    }
}
