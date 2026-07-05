using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FoodRMS.Api.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
        {
            string? tenantIdentifier = null;

            // Skip tenant resolution for login/register paths
            bool isLoginPath = context.Request.Path.StartsWithSegments("/api/auth/login") ||
                               context.Request.Path.StartsWithSegments("/api/auth/login-employee") ||
                               context.Request.Path.StartsWithSegments("/api/auth/register");

            if (!isLoginPath)
            {
                // 1. First: Try X-Tenant-Id header
                if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenantId) &&
                    !string.IsNullOrWhiteSpace(headerTenantId))
                {
                    tenantIdentifier = headerTenantId;
                }
                // 2. Second: Try Admin cookie
                else if (context.Request.Path.StartsWithSegments("/Admin") &&
                         context.Request.Cookies.TryGetValue("Admin-Tenant-Context", out var cookieTenantId))
                {
                    tenantIdentifier = cookieTenantId;
                }
                // 3. Fallback: Extract tenantId from JWT Bearer token claims
                else if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
                {
                    var bearerToken = authHeader.ToString();
                    if (bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        var jwtToken = bearerToken.Substring(7).Trim();
                        try
                        {
                            var handler = new JwtSecurityTokenHandler();
                            if (handler.CanReadToken(jwtToken))
                            {
                                var jwt = handler.ReadJwtToken(jwtToken);
                                // Look for tenantId claim (try multiple common claim names)
                                var tenantClaim = jwt.Claims.FirstOrDefault(c =>
                                    c.Type == "tenantId" ||
                                    c.Type == "tenant_id" ||
                                    c.Type == "TenantId");

                                if (tenantClaim != null && !string.IsNullOrWhiteSpace(tenantClaim.Value))
                                {
                                    tenantIdentifier = tenantClaim.Value;
                                }
                            }
                        }
                        catch
                        {
                            // If JWT parsing fails, continue without tenant
                        }
                    }
                }
            }

            if (!string.IsNullOrEmpty(tenantIdentifier))
            {
                // Try to parse as GUID first
                if (Guid.TryParse(tenantIdentifier, out var tenantId))
                {
                    using (var scope = context.RequestServices.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                        var exists = await dbContext.Tenants
                            .AsNoTracking()
                            .IgnoreQueryFilters()
                            .AnyAsync(t => t.Id == tenantId);

                        if (exists)
                        {
                            tenantService.SetTenant(tenantId);
                        }
                        else
                        {
                            // Only return 401 if it came from an EXPLICIT header (not auto-extracted from JWT)
                            // This prevents blocking [AllowAnonymous] endpoints that don't need tenant context
                            if (context.Request.Headers.ContainsKey("X-Tenant-Id"))
                            {
                                context.Response.StatusCode = 401;
                                await context.Response.WriteAsJsonAsync(new { message = "المطعم غير موجود أو تم حذفه. يرجى تسجيل الدخول مجدداً." });
                                return;
                            }
                            // Otherwise just continue without tenant (for [AllowAnonymous] endpoints)
                        }
                    }
                }
                else
                {
                    // Look up by subdomain string in DB
                    using (var scope = context.RequestServices.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                        var tenant = await dbContext.Tenants
                            .AsNoTracking()
                            .IgnoreQueryFilters()
                            .FirstOrDefaultAsync(t => t.Subdomain == tenantIdentifier);

                        if (tenant != null)
                        {
                            tenantService.SetTenant(tenant.Id);
                        }
                        else if (context.Request.Headers.ContainsKey("X-Tenant-Id"))
                        {
                            context.Response.StatusCode = 401;
                            await context.Response.WriteAsJsonAsync(new { message = "المطعم غير موجود أو تم حذفه. يرجى تسجيل الدخول مجدداً." });
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
