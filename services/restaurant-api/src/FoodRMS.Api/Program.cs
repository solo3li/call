using Casbin;
using FoodRMS.Api.Hubs;
using FoodRMS.Api.Middleware;
using FoodRMS.Api.Services;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Interfaces;
using FoodRMS.Api.Data;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.Infrastructure.Authorization;
using Microsoft.Extensions.FileProviders;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

using DotNetEnv;

Env.Load();
var builder = WebApplication.CreateBuilder(args);



JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => options.CustomSchemaIds(type => type.FullName));

// Multi-tenancy
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITwoFactorService, TwoFactorService>();
builder.Services.AddScoped<ITenantAccessService, TenantAccessService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IDeliveryService, DeliveryService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IPlanService, PlanService>();
builder.Services.AddSingleton<IOrderNotifier, OrderNotifier>();
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("K8sClient", client =>
{
    client.BaseAddress = new Uri("https://kubernetes.default.svc");
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
});
// Telegram bot moved to FoodRMS.BotWorker microservice

// Database
if (builder.Environment.EnvironmentName != "Testing")
{
    builder.Services.AddDbContext<FoodRMSDbContext>((serviceProvider, options) =>
    {
        var config = builder.Configuration;
        if (config.GetValue<bool>("UseInMemoryDatabase"))
        {
            options.UseInMemoryDatabase("FoodRMS_Dev")
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }
        else if (config.GetValue<bool>("UseSqlite"))
        {
            var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "foodrms_shared.db");
            if (Directory.Exists("../../../.."))
                dbPath = Path.GetFullPath("../../../../foodrms_shared.db");
            options.UseSqlite($"Data Source={dbPath}")
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }
        else
        {
            options.UseNpgsql(config.GetConnectionString("DefaultConnection"), sqlOptions =>
            {
                var tenantService = serviceProvider.GetService<ITenantService>();
                var schema = tenantService?.TenantId != Guid.Empty && tenantService?.TenantId != null
                    ? $"tenant_{tenantService.TenantId:N}"
                    : "public";
                sqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", schema);
            })
            .ReplaceService<Microsoft.EntityFrameworkCore.Infrastructure.IModelCacheKeyFactory, TenantModelCacheKeyFactory>()
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }
    });
}

// Identity
builder.Services.AddIdentity<User, AppRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<FoodRMSDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "super_secret_key_that_is_long_enough_123");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/api/orderHub") || path.StartsWithSegments("/api/supportHub")))
                context.Token = accessToken;
            return Task.CompletedTask;
        }
    };
});

// -------------------------------------------------------
// Casbin Authorization — singleton enforcer, model-only
// -------------------------------------------------------
var modelPath = Path.Combine(AppContext.BaseDirectory, "Infrastructure", "Authorization", "rbac_with_domains_model.conf");
if (!File.Exists(modelPath))
    modelPath = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "Authorization", "rbac_with_domains_model.conf");

builder.Services.AddSingleton<IEnforcer>(_ => new Enforcer(modelPath));
builder.Services.AddScoped<IAuthorizationHandler, CasbinAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("orders.read",     p => p.Requirements.Add(new CasbinRequirement("orders",     "read")));
    options.AddPolicy("orders.write",    p => p.Requirements.Add(new CasbinRequirement("orders",     "write")));
    options.AddPolicy("menu.read",       p => p.Requirements.Add(new CasbinRequirement("menu",       "read")));
    options.AddPolicy("menu.write",      p => p.Requirements.Add(new CasbinRequirement("menu",       "write")));
    options.AddPolicy("staff.manage",    p => p.Requirements.Add(new CasbinRequirement("staff",      "*")));
    options.AddPolicy("branches.manage", p => p.Requirements.Add(new CasbinRequirement("branches",   "*")));
    options.AddPolicy("roles.manage",    p => p.Requirements.Add(new CasbinRequirement("roles",      "*")));
    options.AddPolicy("dashboard.read",  p => p.Requirements.Add(new CasbinRequirement("dashboard",  "read")));
});

// SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

var app = builder.Build();

// Seed DB + load Casbin policies
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    int retries = 5;
    while (retries > 0)
    {
        try
        {
            await DbInitializer.SeedAsync(services);
            await CasbinPolicySeeder.SeedAsync(services);

            // Load persisted policies into the singleton enforcer
            var enforcer = app.Services.GetRequiredService<IEnforcer>();
            await CasbinPolicyLoader.LoadPoliciesFromDbAsync(enforcer, app.Services);

            logger.LogInformation("DB seeded and Casbin policies loaded.");
            break;
        }
        catch (Exception ex)
        {
            retries--;
            logger.LogWarning(ex, "Seeding failed. Retrying... ({R} left)", retries);
            if (retries == 0)
                logger.LogError(ex, "Failed to seed database.");
            else
                await Task.Delay(5000);
        }
    }
}

    app.UseSwagger(c =>
    {
        c.RouteTemplate = "api/swagger/{documentName}/swagger.json";
    });
    app.MapScalarApiReference(options =>
    {
        options.EndpointPathPrefix = "/api/scalar/{documentName}";
        options.WithOpenApiRoutePattern("/api/swagger/{documentName}/swagger.json");
    });

// app.UseHttpsRedirection();
app.UseStaticFiles();

app.Use(async (context, next) =>
{
    Console.WriteLine($"Incoming request: {context.Request.Method} {context.Request.Path}");
    await next();
});

app.UseCors("AllowAll");
app.UseMiddleware<TenantMiddleware>();
app.UseAuthentication();
app.UseMiddleware<TenantAccessMiddleware>();
app.UseAuthorization();

app.MapControllerRoute("areas", "{area:exists}/{controller=Home}/{action=Index}/{id?}");
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
app.MapControllers();
app.MapHub<OrderHub>("/api/orderHub");
app.MapHub<SupportHub>("/api/supportHub");
app.MapGet("/", () => Results.Redirect("/Admin"));

app.Run();
