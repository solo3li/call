using FoodRMS.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        public async Task<ActionResult<List<StaffDto>>> GetAll()
        {
            return await _staffService.GetAllAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<StaffDto>> Create([FromBody] CreateStaffRequest request)
        {
            try
            {
                var result = await _staffService.CreateAsync(request.Staff, request.Password);
                if (result == null) return BadRequest("فشل إنشاء الموظف");
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<StaffDto>> Update(Guid id, [FromBody] StaffDto dto)
        {
            var result = await _staffService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _staffService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }

    public class CreateStaffRequest
    {
        public StaffDto Staff { get; set; } = new StaffDto();
        public string Password { get; set; } = string.Empty;
    }
}
