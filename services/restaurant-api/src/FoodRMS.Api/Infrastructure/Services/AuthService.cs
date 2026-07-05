using System;
using System.Collections.Generic;
using System.Net.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Casbin;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Auth;
using FoodRMS.Api.Infrastructure.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private readonly FoodRMSDbContext _context;
        private readonly ITwoFactorService _twoFactorService;
        private readonly ITenantService _tenantService;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEnforcer _enforcer;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(
            UserManager<User> userManager,
            IConfiguration configuration,
            FoodRMSDbContext context,
            ITwoFactorService twoFactorService,
            ITenantService tenantService,
            IServiceProvider serviceProvider,
            IEnforcer enforcer,
            IHttpClientFactory httpClientFactory)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
            _twoFactorService = twoFactorService;
            _tenantService = tenantService;
            _serviceProvider = serviceProvider;
            _enforcer = enforcer;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email)) return null;

            var email = request.Email.Trim().ToLower();
            User? user = null;
            Guid resolvedTenantId = Guid.Empty;

            // 1. Always check global lookup first
            var lookup = await _context.UserTenants
                .AsNoTracking()
                .FirstOrDefaultAsync(ut => ut.Email == email);
            
            if (lookup != null)
            {
                resolvedTenantId = lookup.TenantId;
            }
            else
            {
                resolvedTenantId = _tenantService.TenantId;
            }

            // 2. Perform authentication
            using (var scope = _serviceProvider.CreateScope())
            {
                var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                if (resolvedTenantId != Guid.Empty)
                {
                    scopeTenantService.SetTenant(resolvedTenantId);
                }

                var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                var scopeUserManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

                user = await scopeContext.Users
                    .FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpper());

                if (user == null || !await scopeUserManager.CheckPasswordAsync(user, request.Password))
                {
                    return null;
                }

                // User authenticated!
                var tenant = await scopeContext.Tenants.FindAsync(user.TenantId);
                var baseDomain = _configuration["AppSettings:BaseDomain"] ?? "localhost:5173";
                var subdomain = tenant?.Subdomain ?? user.TenantId.ToString();

                // Fetch permissions from user roles
                var userRoles = await scopeContext.Roles
                    .Where(r => scopeContext.UserRoles.Any(ur => ur.UserId == user.Id && ur.RoleId == r.Id))
                    .ToListAsync();
                var roleIds = userRoles.Select(r => r.Id).ToList();
                var permissions = await scopeContext.RolePermissions
                    .Where(rp => roleIds.Contains(rp.RoleId))
                    .Join(scopeContext.Permissions, rp => rp.PermissionId, p => p.Id, (rp, p) => p.Code)
                    .Distinct()
                    .ToListAsync();

                var token = await GenerateJwtToken(user);

                return new LoginResponse
                {
                    Token = token,
                    UserName = user.FullName,
                    UserRole = user.Role,
                    BranchId = user.BranchId,
                    Permissions = permissions,
                    Tenant = new TenantDto
                    {
                        Id = user.TenantId,
                        Name = tenant?.Name ?? string.Empty,
                        Subdomain = subdomain,
                        LoginUrl = "", CurrencyCode = tenant?.Currency?.Code ?? "SAR", CurrencySymbol = tenant?.Currency?.Symbol ?? "ر.س"
                    }
                };
            }
        }

        /// <summary>
        /// Authenticates an employee using only their TOTP code from FoodRMS TOTP.
        /// Iterates all users in the current tenant that have a TotpSecretKey configured.
        /// </summary>
        public async Task<LoginResponse?> LoginEmployeeByTotpAsync(string totpCode)
        {
            if (string.IsNullOrWhiteSpace(totpCode))
                return null;

            if (totpCode == "DRIVERTEST" || totpCode == "123456")
            {
                // Bypass DB completely for testing the driver app
                var tenantId = Guid.Parse("660e8400-e29b-41d4-a716-446655440001"); // Burger House
                return new LoginResponse
                {
                    Token = await GenerateJwtToken(new User { Id = Guid.NewGuid(), Email = "driver@demo.com", Role = "Driver", TenantId = tenantId }),
                    UserName = "Mandoob",
                    UserRole = "Driver",
                    BranchId = null,
                    Permissions = new List<string>(),
                    Tenant = new TenantDto
                    {
                        Id = tenantId,
                        Name = "Burger House",
                        Subdomain = "burgerhouse",
                        LoginUrl = "", CurrencyCode = "SAR", CurrencySymbol = "ر.س"
                    }
                };
            }

            if (totpCode.Length < 6)
                return null;

            var currentTenantId = _tenantService.TenantId;
            string? matchedEmail = null;
            Guid resolvedTenantId = currentTenantId;

            // 1. Initial attempt: If we have a tenant context, check it first
            if (currentTenantId != Guid.Empty)
            {
                var candidates = await _context.Users
                    .Where(u => u.TenantId == currentTenantId && u.TotpSecretKey != null && u.Role != "Owner")
                    .ToListAsync();
                
                foreach (var candidate in candidates)
                {
                    if (_twoFactorService.ValidateToken(candidate.TotpSecretKey!, totpCode))
                    {
                        matchedEmail = candidate.UserName;
                        break;
                    }
                }
            }

            // 2. Secondary attempt: If not found in current context (or no context), check ALL users in global lookup
            if (matchedEmail == null)
            {
                var lookups = await _context.UserTenants
                    .AsNoTracking()
                    .Where(ut => ut.TotpSecretKey != null)
                    .ToListAsync();
                
                foreach (var lookup in lookups)
                {
                    if (_twoFactorService.ValidateToken(lookup.TotpSecretKey!, totpCode))
                    {
                        matchedEmail = lookup.Email;
                        resolvedTenantId = lookup.TenantId;
                        break;
                    }
                }
            }

            if (matchedEmail == null) return null;

            // 3. User identified! Perform authentication in the correct tenant context
            using (var scope = _serviceProvider.CreateScope())
            {
                var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                scopeTenantService.SetTenant(resolvedTenantId);
                var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                
                // Re-fetch in target schema (case-insensitive email)
                var user = await scopeContext.Users
                    .FirstOrDefaultAsync(u => u.NormalizedUserName == matchedEmail.ToUpper());
                
                if (user == null) return null;

                var tenant = await scopeContext.Tenants.FindAsync(user.TenantId);
                var baseDomain = _configuration["AppSettings:BaseDomain"] ?? "localhost:5173";
                var subdomain = tenant?.Subdomain ?? user.TenantId.ToString();

                var jwtToken = await GenerateJwtToken(user);

                // Fetch permissions
                var empRoles = await scopeContext.Roles
                    .Where(r => scopeContext.UserRoles.Any(ur => ur.UserId == user.Id && ur.RoleId == r.Id))
                    .ToListAsync();
                var empRoleIds = empRoles.Select(r => r.Id).ToList();
                var empPermissions = await scopeContext.RolePermissions
                    .Where(rp => empRoleIds.Contains(rp.RoleId))
                    .Join(scopeContext.Permissions, rp => rp.PermissionId, p => p.Id, (rp, p) => p.Code)
                    .Distinct()
                    .ToListAsync();

                return new LoginResponse
                {
                    Token = jwtToken,
                    UserName = user.FullName,
                    UserRole = user.Role,
                    BranchId = user.BranchId,
                    Permissions = empPermissions,
                    Tenant = new TenantDto
                    {
                        Id = user.TenantId,
                        Name = tenant?.Name ?? string.Empty,
                        Subdomain = subdomain,
                        LoginUrl = "", CurrencyCode = tenant?.Currency?.Code ?? "SAR", CurrencySymbol = tenant?.Currency?.Symbol ?? "ر.س"
                    }
                };
            }
        }


        public async Task<LoginResponse?> RegisterAsync(RegisterRequest request)
        {
            // Check if email already exists globally
            var emailLower = request.Email.Trim().ToLower();
            var existingUser = await _context.UserTenants
                .AsNoTracking()
                .AnyAsync(ut => ut.Email == emailLower);
            if (existingUser)
            {
                throw new Exception("البريد الإلكتروني مسجل بالفعل");
            }

            var tenantId = Guid.NewGuid();
            var subdomain = tenantId.ToString(); // Automatic UUID subdomain

            var tenant = new Tenant
            {
                Id = tenantId,
                Name = request.RestaurantName,
                Subdomain = subdomain,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                PlanId = request.PlanId
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            // Provision the business schema for the new tenant
            if (_context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                    scopeTenantService.SetTenant(tenantId);
                    var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();

                    var schemaName = $"tenant_{tenantId:N}";
                    await scopeContext.Database.ExecuteSqlRawAsync($"CREATE SCHEMA IF NOT EXISTS {schemaName}");
                    
                    // Generate and fix script for idempotency
                    var script = scopeContext.Database.GenerateCreateScript();
                    script = script.Replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ");
                    script = script.Replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ");
                    script = script.Replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ");
                    await scopeContext.Database.ExecuteSqlRawAsync(script);

                    // Ensure custom columns exist (same as DbInitializer)
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"FullName\" text NOT NULL DEFAULT '';");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TenantId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Role\" text NOT NULL DEFAULT '';");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"BranchId\" uuid NULL;");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"OrdersHandled\" integer NOT NULL DEFAULT 0;");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Rating\" double precision NOT NULL DEFAULT 0;");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"Status\" text NOT NULL DEFAULT 'Available';");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"DepartmentId\" uuid NULL;");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"EmployeeCode\" text NULL;");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"TotpSecretKey\" text NULL;");

                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetRoles\" ADD COLUMN IF NOT EXISTS \"TenantId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                    await scopeContext.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{schemaName}\".\"AspNetRoles\" ADD COLUMN IF NOT EXISTS \"DepartmentId\" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
                }
                catch (Exception)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                    scopeTenantService.SetTenant(tenantId);
                    var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                    scopeContext.Database.EnsureCreated();
                }
            }
            else
            {
                using var scope = _serviceProvider.CreateScope();
                var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                scopeTenantService.SetTenant(tenantId);
                var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();
                scopeContext.Database.EnsureCreated();
            }

            // Create the owner user
            using var userScope = _serviceProvider.CreateScope();
            var userTenantService = userScope.ServiceProvider.GetRequiredService<ITenantService>();
            userTenantService.SetTenant(tenantId);
            var userUserManager = userScope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var userContext = userScope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                TenantId = tenantId,
                Role = "Owner"
            };

            var result = await userUserManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception(errors);
            }

            // Add to global lookup
            userContext.UserTenants.Add(new UserTenant { Email = user.Email!.ToLower(), TenantId = tenantId });
            
            // Create a default department
            var defaultDept = new Department
            {
                Id = Guid.NewGuid(),
                Name = "عام",
                TenantId = tenantId
            };
            userContext.Departments.Add(defaultDept);
            
            await userContext.SaveChangesAsync();

            // Seed Casbin role assignment for this owner
            await CasbinPolicySeeder.AssignUserRoleAsync(userContext, _enforcer, user.Id.ToString(), "Owner", tenantId.ToString());

            // Create ingress rule for the new tenant
            var baseDomain = _configuration["AppSettings:BaseDomain"] ?? "localhost:5173";
            await CreateTenantIngressAsync(tenantId.ToString(), subdomain, baseDomain);

            var token = await GenerateJwtToken(user);

            return new LoginResponse
            {
                Token = token,
                UserName = user.FullName,
                UserRole = user.Role,
                Tenant = new TenantDto
                {
                    Id = user.TenantId,
                    Name = tenant.Name,
                    Subdomain = tenant.Subdomain,
                    LoginUrl = "", CurrencyCode = tenant?.Currency?.Code ?? "SAR", CurrencySymbol = tenant?.Currency?.Symbol ?? "ر.س"
                }
            };
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
                return false;

            var emailLower = request.Email.Trim().ToLower();

            // Look up the tenant for this email
            var lookup = await _context.UserTenants
                .AsNoTracking()
                .FirstOrDefaultAsync(ut => ut.Email == emailLower);

            if (lookup == null) return false;

            // Switch to the user's tenant schema
            using var scope = _serviceProvider.CreateScope();
            var scopeTenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
            scopeTenantService.SetTenant(lookup.TenantId);

            var scopeUserManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var scopeContext = scope.ServiceProvider.GetRequiredService<FoodRMSDbContext>();

            var user = await scopeContext.Users
                .FirstOrDefaultAsync(u => u.NormalizedEmail == emailLower.ToUpper());

            if (user == null) return false;

            // Generate a reset token and apply the new password
            var resetToken = await scopeUserManager.GeneratePasswordResetTokenAsync(user);
            var result = await scopeUserManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

            return result.Succeeded;
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "super_secret_key_that_is_long_enough_123");

            using var scope = _serviceProvider.CreateScope();
            var tenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
            tenantService.SetTenant(user.TenantId);
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            var roles = await userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("tenantId", user.TenantId.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"] ?? "60")),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private async Task CreateTenantIngressAsync(string tenantId, string subdomain, string baseDomain)
        {
            if (baseDomain.Contains("localhost") || baseDomain.Contains("127.0.0.1"))
                return; // Skip for local dev

            var ingressName = $"tenant-{tenantId}-ingress";
            var hostName = $"{subdomain}.{baseDomain}";
            
            var ingressJson = $$"""
            {
              "apiVersion": "networking.k8s.io/v1",
              "kind": "Ingress",
              "metadata": {
                "name": "{{ingressName}}",
                "namespace": "default",
                "annotations": {
                  "cert-manager.io/cluster-issuer": "letsencrypt-prod"
                }
              },
              "spec": {
                "tls": [
                  {
                    "hosts": [
                      "{{hostName}}"
                    ],
                    "secretName": "tenant-{{tenantId}}-tls"
                  }
                ],
                "rules": [
                  {
                    "host": "{{hostName}}",
                    "http": {
                      "paths": [
                        {
                          "path": "/api",
                          "pathType": "Prefix",
                          "backend": {
                            "service": {
                              "name": "backend",
                              "port": { "number": 5109 }
                            }
                          }
                        },
                        {
                          "path": "/",
                          "pathType": "Prefix",
                          "backend": {
                            "service": {
                              "name": "frontend",
                              "port": { "number": 80 }
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
            """;

            try
            {
                var client = _httpClientFactory.CreateClient("K8sClient");
                
                // Set the token if available in the pod
                var tokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";
                if (System.IO.File.Exists(tokenPath))
                {
                    var token = await System.IO.File.ReadAllTextAsync(tokenPath);
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }

                var content = new StringContent(ingressJson, Encoding.UTF8, "application/json");
                var response = await client.PostAsync("/apis/networking.k8s.io/v1/namespaces/default/ingresses", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    // Check if it already exists (409 Conflict)
                    if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                    {
                        Console.WriteLine($"Ingress {ingressName} already exists.");
                    }
                    else
                    {
                        var error = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Failed to create ingress {ingressName}. Status: {response.StatusCode}, Error: {error}");
                    }
                }
                else
                {
                    Console.WriteLine($"Successfully created ingress {ingressName} for {hostName}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating ingress: {ex.Message}");
            }
        }

        public async Task<bool> CheckSslStatusAsync(string tenantId)
        {
            var certificateName = $"tenant-{tenantId}-tls";
            try
            {
                var client = _httpClientFactory.CreateClient("K8sClient");
                
                var tokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";
                if (System.IO.File.Exists(tokenPath))
                {
                    var token = await System.IO.File.ReadAllTextAsync(tokenPath);
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }

                var response = await client.GetAsync($"/apis/cert-manager.io/v1/namespaces/default/certificates/{certificateName}");
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }

                var jsonStr = await response.Content.ReadAsStringAsync();
                using var doc = System.Text.Json.JsonDocument.Parse(jsonStr);
                
                if (doc.RootElement.TryGetProperty("status", out var statusEl) &&
                    statusEl.TryGetProperty("conditions", out var conditionsEl) &&
                    conditionsEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    foreach (var condition in conditionsEl.EnumerateArray())
                    {
                        if (condition.TryGetProperty("type", out var typeEl) && typeEl.GetString() == "Ready" &&
                            condition.TryGetProperty("status", out var statusValEl) && statusValEl.GetString() == "True")
                        {
                            return true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking SSL status for tenant {tenantId}: {ex.Message}");
            }
            return false;
        }
    }
}
