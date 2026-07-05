using FoodRMS.Api.Data;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace FoodRMS.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class ManageController : Controller
    {
        private readonly FoodRMSDbContext _context;

        public ManageController(FoodRMSDbContext context)
        {
            _context = context;
        }

        private (object dbSet, Type entityType) GetDbSetAndType(string modelName)
        {
            var property = typeof(FoodRMSDbContext).GetProperties()
                .FirstOrDefault(p => p.Name.Equals(modelName, StringComparison.OrdinalIgnoreCase) 
                                  && p.PropertyType.IsGenericType 
                                  && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>));
            
            if (property == null) return (null, null);
            return (property.GetValue(_context), property.PropertyType.GetGenericArguments()[0]);
        }

        public IActionResult Index()
        {
            var dbSetProperties = typeof(FoodRMSDbContext).GetProperties()
                .Where(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
                .Select(p => p.Name)
                .OrderBy(n => n)
                .ToList();

            if (Request.Cookies.TryGetValue("Admin-Tenant-Context", out var cookieTenantId) && Guid.TryParse(cookieTenantId, out Guid parsedId))
            {
                ViewBag.ActiveTenantId = parsedId;
            }

            return View(dbSetProperties);
        }

        [HttpGet]
        public IActionResult ExploreTenant(Guid tenantId)
        {
            Response.Cookies.Append("Admin-Tenant-Context", tenantId.ToString(), new CookieOptions { Path = "/Admin" });
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult ExitTenantExplorer()
        {
            Response.Cookies.Delete("Admin-Tenant-Context", new CookieOptions { Path = "/Admin" });
            return RedirectToAction(nameof(Index));
        }

        public IActionResult List(string id)
        {
            var (dbSet, entityType) = GetDbSetAndType(id);
            if (dbSet == null) return NotFound();

            var iQueryable = (IQueryable)dbSet;
            var results = new List<object>();
            
            int count = 0;
            foreach (var item in iQueryable)
            {
                results.Add(item);
                count++;
                if (count >= 100) break; // Limit to 100 for performance
            }

            ViewBag.EntityName = id;
            ViewBag.EntityType = entityType;

            return View(results);
        }

        public IActionResult Create(string id)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null) return NotFound();

            var entity = Activator.CreateInstance(entityType);
            ViewBag.EntityName = id;
            ViewBag.EntityType = entityType;

            return View(entity);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(string id, IFormCollection form)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null) return NotFound();

            var entity = Activator.CreateInstance(entityType);
            PopulateEntity(entity, entityType, form, isCreate: true);

            _context.Add(entity);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(List), "Manage", new { id });
        }

        public async Task<IActionResult> Edit(string id, string pk)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null || !Guid.TryParse(pk, out Guid guidPk)) return NotFound();

            var entity = await _context.FindAsync(entityType, guidPk);
            if (entity == null) return NotFound();

            ViewBag.EntityName = id;
            ViewBag.EntityType = entityType;

            return View(entity);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, string pk, IFormCollection form)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null || !Guid.TryParse(pk, out Guid guidPk)) return NotFound();

            var entity = await _context.FindAsync(entityType, guidPk);
            if (entity == null) return NotFound();

            PopulateEntity(entity, entityType, form, isCreate: false);

            _context.Update(entity);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(List), "Manage", new { id });
        }

        public async Task<IActionResult> Details(string id, string pk)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null || !Guid.TryParse(pk, out Guid guidPk)) return NotFound();

            var entity = await _context.FindAsync(entityType, guidPk);
            if (entity == null) return NotFound();

            ViewBag.EntityName = id;
            ViewBag.EntityType = entityType;

            return View(entity);
        }

        public async Task<IActionResult> Delete(string id, string pk)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null || !Guid.TryParse(pk, out Guid guidPk)) return NotFound();

            var entity = await _context.FindAsync(entityType, guidPk);
            if (entity == null) return NotFound();

            ViewBag.EntityName = id;
            ViewBag.EntityType = entityType;

            return View(entity);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(string id, string pk)
        {
            var (_, entityType) = GetDbSetAndType(id);
            if (entityType == null || !Guid.TryParse(pk, out Guid guidPk)) return NotFound();

            var entity = await _context.FindAsync(entityType, guidPk);
            if (entity != null)
            {
                _context.Remove(entity);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction(nameof(List), "Manage", new { id });
        }

        public IActionResult Schema()
        {
            var entityTypes = _context.Model.GetEntityTypes().Where(e => !e.IsOwned()).ToList();

            string GetDomainColor(string name)
            {
                if (name.Contains("User") || name.Contains("Role") || name.Contains("Permission")) return "#8b5cf6"; // Purple
                if (name.Contains("Tenant") || name.Contains("Plan") || name.Contains("Branch")) return "#3b82f6"; // Blue
                if (name.Contains("Order") || name.Contains("Customer")) return "#10b981"; // Green
                if (name.Contains("Menu")) return "#f59e0b"; // Orange
                if (name.Contains("Support") || name.Contains("Ticket")) return "#ef4444"; // Red
                return "#64748b"; // Gray
            }

            string GetDomainIcon(string name)
            {
                if (name.Contains("User") || name.Contains("Role") || name.Contains("Permission")) return "\uf4fb"; // shield-lock
                if (name.Contains("Tenant") || name.Contains("Plan") || name.Contains("Branch")) return "\uf1bb"; // buildings
                if (name.Contains("Order")) return "\uf751"; // receipt
                if (name.Contains("Customer")) return "\uf4d7"; // people
                if (name.Contains("Menu")) return "\uf2a3"; // cup-hot
                if (name.Contains("Support") || name.Contains("Ticket")) return "\uf421"; // headset
                return "\uf2db"; // database
            }

            string GetDomainGroup(string name)
            {
                if (name.Contains("User") || name.Contains("Role") || name.Contains("Permission")) return "Security & Access";
                if (name.Contains("Tenant") || name.Contains("Plan") || name.Contains("Branch")) return "Core SaaS";
                if (name.Contains("Order") || name.Contains("Customer")) return "Sales & CRM";
                if (name.Contains("Menu")) return "Catalog";
                if (name.Contains("Support") || name.Contains("Ticket")) return "Customer Support";
                return "System";
            }

            var nodes = entityTypes.Select(e => {
                var color = GetDomainColor(e.ClrType.Name);
                return new 
                {
                    id = e.Name,
                    label = e.ClrType.Name,
                    group = GetDomainGroup(e.ClrType.Name),
                    shape = "box",
                    margin = 15,
                    borderWidth = 2,
                    borderWidthSelected = 4,
                    color = new { 
                        background = "#ffffff", 
                        border = color,
                        highlight = new { background = color, border = color }
                    },
                    font = new { color = "#0f172a", face = "system-ui", size = 16, multi = true, bold = true },
                    shadow = new { enabled = true, color = "rgba(0,0,0,0.1)", size = 10, x = 2, y = 4 }
                };
            }).ToList();

            var edges = new List<object>();
            foreach(var et in entityTypes)
            {
                foreach(var fk in et.GetForeignKeys())
                {
                    edges.Add(new 
                    {
                        from = et.Name,
                        to = fk.PrincipalEntityType.Name,
                        label = fk.PrincipalToDependent?.Name ?? fk.DependentToPrincipal?.Name ?? "FK",
                        font = new { align = "top", size = 10, color = "#94a3b8" },
                        arrows = "to",
                        color = new { color = "#cbd5e1", highlight = "#3b82f6", hover = "#3b82f6" },
                        smooth = new { type = "cubicBezier", forceDirection = "none", roundness = 0.5 },
                        width = 1.5,
                        selectionWidth = 3
                    });
                }
            }

            ViewBag.Nodes = System.Text.Json.JsonSerializer.Serialize(nodes);
            ViewBag.Edges = System.Text.Json.JsonSerializer.Serialize(edges);

            return View();
        }

        [HttpGet]
        public IActionResult GetEntityProperties(string id)
        {
            var entityType = _context.Model.GetEntityTypes().FirstOrDefault(e => e.Name == id);
            if (entityType == null) return NotFound();

            var properties = entityType.GetProperties().Select(p => new
            {
                name = p.Name,
                type = p.ClrType.Name,
                isPrimaryKey = p.IsPrimaryKey(),
                isForeignKey = p.IsForeignKey(),
                isNullable = p.IsNullable
            }).ToList();

            var navigations = entityType.GetNavigations().Select(n => new
            {
                name = n.Name,
                target = n.TargetEntityType.ClrType.Name,
                isCollection = n.IsCollection
            }).ToList();

            return Json(new { table = entityType.ClrType.Name, columns = properties, relations = navigations });
        }

        private void PopulateEntity(object entity, Type entityType, IFormCollection form, bool isCreate)
        {
            foreach (var prop in entityType.GetProperties().Where(p => p.CanWrite))
            {
                if (prop.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
                {
                    if (isCreate && prop.PropertyType == typeof(Guid))
                    {
                        prop.SetValue(entity, Guid.NewGuid());
                    }
                    continue; // Do not bind ID from form
                }

                if (IsBindableType(prop.PropertyType))
                {
                    if (form.TryGetValue(prop.Name, out var stringValues))
                    {
                        var valueStr = stringValues.FirstOrDefault();
                        if (string.IsNullOrEmpty(valueStr)) continue;

                        try
                        {
                            object convertedValue = null;
                            Type targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

                            if (targetType == typeof(Guid)) convertedValue = Guid.Parse(valueStr);
                            else if (targetType == typeof(DateTime)) convertedValue = DateTime.Parse(valueStr);
                            else if (targetType == typeof(bool)) convertedValue = valueStr.Contains("true", StringComparison.OrdinalIgnoreCase) || valueStr == "on";
                            else convertedValue = Convert.ChangeType(valueStr, targetType);

                            prop.SetValue(entity, convertedValue);
                        }
                        catch { } // Ignore complex bindings that fail
                    }
                    else if (prop.PropertyType == typeof(bool) || prop.PropertyType == typeof(bool?))
                    {
                        // Checkbox unchecked scenario
                        prop.SetValue(entity, false);
                    }
                }
            }
        }

        public static bool IsBindableType(Type type)
        {
            var t = Nullable.GetUnderlyingType(type) ?? type;
            return t.IsPrimitive || t == typeof(string) || t == typeof(decimal) || t == typeof(Guid) || t == typeof(DateTime);
        }
    }
}