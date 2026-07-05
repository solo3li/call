using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Plans;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly IPlanService _planService;

        public PlansController(IPlanService planService)
        {
            _planService = planService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PlanDto>>> GetAll()
        {
            return Ok(await _planService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlanDto>> GetById(Guid id)
        {
            var plan = await _planService.GetByIdAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpPost]
        public async Task<ActionResult<PlanDto>> Create([FromBody] PlanDto dto)
        {
            var result = await _planService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PlanDto>> Update(Guid id, [FromBody] PlanDto dto)
        {
            var result = await _planService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _planService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
