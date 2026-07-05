using FoodRMS.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Departments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public DepartmentsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<DepartmentDto>>> GetAll()
        {
            return await _context.Departments
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    EmployeeCount = _context.Users.Count(u => u.DepartmentId == d.Id)
                })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> Create(CreateDepartmentRequest request)
        {
            var dept = new Department { Id = Guid.NewGuid(), Name = request.Name };
            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();
            return Ok(new DepartmentDto { Id = dept.Id, Name = dept.Name });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return NotFound();
            
            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
