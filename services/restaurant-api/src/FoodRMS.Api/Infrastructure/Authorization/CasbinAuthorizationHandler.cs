using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Casbin;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace FoodRMS.Api.Infrastructure.Authorization
{
    /// <summary>
    /// Requirement that enforces a Casbin policy check.
    /// </summary>
    public class CasbinRequirement : IAuthorizationRequirement
    {
        public string Resource { get; }
        public string Action { get; }

        public CasbinRequirement(string resource, string action)
        {
            Resource = resource;
            Action = action;
        }
    }

    /// <summary>
    /// ASP.NET Core authorization handler that delegates to Casbin enforcer.
    /// Checks: enforcer.Enforce(userId, tenantId, resource, action)
    /// </summary>
    public class CasbinAuthorizationHandler : AuthorizationHandler<CasbinRequirement>
    {
        private readonly IServiceProvider _serviceProvider;

        public CasbinAuthorizationHandler(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            CasbinRequirement requirement)
        {
            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                      ?? context.User.FindFirst("sub")?.Value;
            var tenantId = context.User.FindFirst("tenantId")?.Value;
            var role = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(tenantId))
            {
                context.Fail();
                return Task.CompletedTask;
            }

            // Owners and global admins always pass
            if (role == "Owner")
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            var enforcer = _serviceProvider.GetRequiredService<IEnforcer>();

            // Try by userId first, then by role name
            bool allowed = enforcer.Enforce(userId, tenantId, requirement.Resource, requirement.Action)
                        || (!string.IsNullOrEmpty(role) && enforcer.Enforce(role, tenantId, requirement.Resource, requirement.Action));

            if (allowed)
                context.Succeed(requirement);
            else
                context.Fail();

            return Task.CompletedTask;
        }
    }
}
