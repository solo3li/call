using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace FoodRMS.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class TenantsController : Controller
    {
        private readonly FoodRMSDbContext _context;

        public TenantsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var tenants = await _context.Tenants.Include(t => t.Plan).ToListAsync();
            return View(tenants);
        }

        public IActionResult Create()
        {
            ViewData["PlanId"] = new SelectList(_context.Plans, "Id", "Name");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,Subdomain,IsActive,PlanId")] Tenant tenant)
        {
            if (ModelState.IsValid)
            {
                tenant.Id = Guid.NewGuid();
                _context.Add(tenant);
                await _context.SaveChangesAsync();
                
                // We should normally trigger schema creation and seeding here.
                // For this SaaS admin prototype, saving the tenant is sufficient.

                return RedirectToAction(nameof(Index), "Tenants");
            }
            ViewData["PlanId"] = new SelectList(_context.Plans, "Id", "Name", tenant.PlanId);
            return View(tenant);
        }

        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null) return NotFound();

            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return NotFound();

            ViewData["PlanId"] = new SelectList(_context.Plans, "Id", "Name", tenant.PlanId);
            return View(tenant);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Subdomain,IsActive,PlanId")] Tenant tenant)
        {
            if (id != tenant.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(tenant);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!TenantExists(tenant.Id)) return NotFound();
                    else throw;
                }
                return RedirectToAction(nameof(Index), "Tenants");
            }
            ViewData["PlanId"] = new SelectList(_context.Plans, "Id", "Name", tenant.PlanId);
            return View(tenant);
        }

        private bool TenantExists(Guid id)
        {
            return _context.Tenants.Any(e => e.Id == id);
        }
    }
}