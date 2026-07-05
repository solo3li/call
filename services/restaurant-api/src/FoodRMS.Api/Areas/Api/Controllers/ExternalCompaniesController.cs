using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExternalCompaniesController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public ExternalCompaniesController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ExternalCompany>>> GetAll()
        {
            return await _context.ExternalCompanies.ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<ActionResult<ExternalCompany>> Create([FromBody] ExternalCompany model)
        {
            model.Id = Guid.NewGuid();
            model.CreatedAt = DateTime.UtcNow;
            model.UpdatedAt = DateTime.UtcNow;

            _context.ExternalCompanies.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = model.Id }, model);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<ActionResult<ExternalCompany>> Update(Guid id, [FromBody] ExternalCompany model)
        {
            var existing = await _context.ExternalCompanies.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = model.Name;
            existing.IsActive = model.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }
    }
}
