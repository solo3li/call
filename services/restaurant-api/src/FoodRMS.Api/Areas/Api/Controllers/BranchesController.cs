using FoodRMS.Api.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Branches;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BranchesController : ControllerBase
    {
        private readonly IBranchService _branchService;

        public BranchesController(IBranchService branchService)
        {
            _branchService = branchService;
        }

        [HttpGet]
        public async Task<ActionResult<List<BranchDto>>> GetAll()
        {
            return await _branchService.GetAllAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<BranchDto>> Create([FromBody] BranchDto dto)
        {
            try
            {
                var result = await _branchService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BranchDto>> Update(Guid id, [FromBody] BranchDto dto)
        {
            var result = await _branchService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _branchService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
