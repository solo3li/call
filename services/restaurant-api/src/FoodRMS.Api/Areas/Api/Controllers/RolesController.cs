using FoodRMS.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly FoodRMSDbContext _context;

        public RolesController(RoleManager<AppRole> roleManager, FoodRMSDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<RoleDto>>> GetAll()
        {
            return await _context.Roles
                .Include(r => r.Department)
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name!,
                    DepartmentId = r.DepartmentId,
                    DepartmentName = r.Department.Name,
                    Permissions = r.RolePermissions.Select(rp => rp.Permission.Code).ToList()
                })
                .ToListAsync();
        }

        [HttpGet("permissions")]
        public async Task<ActionResult<List<PermissionDto>>> GetPermissions()
        {
            return await _context.Permissions
                .Select(p => new PermissionDto { Name = p.Name, Code = p.Code, Group = p.Group })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<RoleDto>> Create(CreateRoleRequest request)
        {
            var departmentId = request.DepartmentId;
            
            // If departmentId is empty or not provided, use the first available department for this tenant
            if (departmentId == Guid.Empty)
            {
                var defaultDept = await _context.Departments.FirstOrDefaultAsync();
                if (defaultDept == null)
                {
                    // If no departments exist, create a default one
                    defaultDept = new Department
                    {
                        Id = Guid.NewGuid(),
                        Name = "عام"
                    };
                    _context.Departments.Add(defaultDept);
                    await _context.SaveChangesAsync();
                }
                departmentId = defaultDept.Id;
            }

            var role = new AppRole 
            { 
                Id = Guid.NewGuid(), 
                Name = request.Name, 
                DepartmentId = departmentId 
            };
            
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            foreach (var code in request.Permissions)
            {
                var perm = await _context.Permissions.FirstOrDefaultAsync(p => p.Code == code);
                if (perm != null)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = perm.Id });
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new RoleDto { Id = role.Id, Name = role.Name, DepartmentId = role.DepartmentId });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RoleDto>> Update(Guid id, CreateRoleRequest request)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null) return NotFound();

            role.Name = request.Name;
            if (request.DepartmentId != Guid.Empty)
            {
                role.DepartmentId = request.DepartmentId;
            }

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // Update permissions: Remove existing and add new
            var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync();
            _context.RolePermissions.RemoveRange(existingPerms);

            foreach (var code in request.Permissions)
            {
                var perm = await _context.Permissions.FirstOrDefaultAsync(p => p.Code == code);
                if (perm != null)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = perm.Id });
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new RoleDto { Id = role.Id, Name = role.Name, DepartmentId = role.DepartmentId });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null) return NotFound();

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return NoContent();
        }
    }
}
