using System;
using System.Threading.Tasks;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Infrastructure.Services;
using Microsoft.AspNetCore.Http;

namespace FoodRMS.Api.Middleware
{
    public class TenantAccessMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantAccessMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantService tenantService, ITenantAccessService tenantAccessService)
        {
            // If the user is authenticated, check if they belong to the current tenant
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var currentTenantId = tenantService.TenantId;

                // Fallback: If tenantId is not set (e.g. direct IP access), try to get it from user claims
                if (currentTenantId == Guid.Empty)
                {
                    var claimTenantId = context.User.FindFirst("tenantId")?.Value;
                    if (Guid.TryParse(claimTenantId, out var parsedId))
                    {
                        currentTenantId = parsedId;
                        tenantService.SetTenant(parsedId);
                    }
                }

                // If still empty, and the user is NOT a global admin, block access
                // (Unless it's a known global endpoint, but here we assume multi-tenant context)
                if (currentTenantId == Guid.Empty)
                {
                    Console.WriteLine($"[TenantAccess] 403: currentTenantId is empty. Claims: {string.Join(", ", context.User.Claims.Select(c => c.Type + "=" + c.Value))}");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { message = "No tenant context detected. Please use a tenant subdomain or provide X-Tenant-Id." });
                    return;
                }

                // Verify user belongs to this tenant
                if (!tenantAccessService.IsUserInTenant(context.User, currentTenantId))
                {
                    Console.WriteLine($"[TenantAccess] 403: IsUserInTenant is false. currentTenantId={currentTenantId}. Claims: {string.Join(", ", context.User.Claims.Select(c => c.Type + "=" + c.Value))}");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { message = "You do not have access to this tenant branch." });
                    return;
                }
            }

            await _next(context);
        }
    }
}
