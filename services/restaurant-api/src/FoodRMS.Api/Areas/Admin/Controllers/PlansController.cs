using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace FoodRMS.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class PlansController : Controller
    {
        private readonly FoodRMSDbContext _context;

        public PlansController(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            return View(await _context.Plans.ToListAsync());
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,MaxBranches,MaxEmployees,Price,IsCustom")] Plan plan)
        {
            if (ModelState.IsValid)
            {
                plan.Id = Guid.NewGuid();
                _context.Add(plan);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index), "Plans");
            }
            return View(plan);
        }

        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null) return NotFound();

            var plan = await _context.Plans.FindAsync(id);
            if (plan == null) return NotFound();
            
            return View(plan);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,MaxBranches,MaxEmployees,Price,IsCustom")] Plan plan)
        {
            if (id != plan.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(plan);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!PlanExists(plan.Id)) return NotFound();
                    else throw;
                }
                return RedirectToAction(nameof(Index), "Plans");
            }
            return View(plan);
        }

        private bool PlanExists(Guid id)
        {
            return _context.Plans.Any(e => e.Id == id);
        }
    }
}