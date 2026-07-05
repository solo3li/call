using FoodRMS.Api.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Customers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CustomerDto>>> GetAll()
        {
            return await _customerService.GetAllAsync();
        }

        [HttpPost]
        public async Task<ActionResult<CustomerDto>> Create([FromBody] CustomerDto dto)
        {
            var result = await _customerService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CustomerDto>> Update(Guid id, [FromBody] CustomerDto dto)
        {
            var result = await _customerService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _customerService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
