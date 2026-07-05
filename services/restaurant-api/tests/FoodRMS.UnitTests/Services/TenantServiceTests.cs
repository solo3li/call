using System;
using FoodRMS.Api.Infrastructure.Services;
using Xunit;
using FluentAssertions;

namespace FoodRMS.UnitTests.Services
{
    public class TenantServiceTests
    {
        [Fact]
        public void SetTenant_ShouldUpdateTenantId()
        {
            // Arrange
            var service = new TenantService();
            var tenantId = Guid.NewGuid();

            // Act
            service.SetTenant(tenantId);

            // Assert
            service.TenantId.Should().Be(tenantId);
        }
    }
}
