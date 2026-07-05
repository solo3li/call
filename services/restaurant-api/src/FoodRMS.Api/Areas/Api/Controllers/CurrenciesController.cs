using System;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [Route("api/[controller]")]
    [ApiController]
    public class CurrenciesController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public CurrenciesController(FoodRMSDbContext context)
        {
            _context = context;
        }

        // GET: api/currencies
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var currencies = await _context.Currencies
                .Where(c => c.IsActive)
                .Select(c => new { c.Id, c.Name, c.Code, c.Symbol })
                .ToListAsync();
                
            return Ok(currencies);
        }

        // POST: api/currencies
        [HttpPost]
        [Authorize(Roles = "Admin_demo")] // Or SuperAdmin if it exists
        public async Task<IActionResult> Create([FromBody] Currency currency)
        {
            if (string.IsNullOrWhiteSpace(currency.Name) || string.IsNullOrWhiteSpace(currency.Code))
                return BadRequest(new { message = "Name and Code are required." });

            currency.Id = Guid.NewGuid();
            _context.Currencies.Add(currency);
            await _context.SaveChangesAsync();

            return Ok(currency);
        }

        // PUT: api/currencies/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin_demo")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Currency currencyInput)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null) return NotFound();

            currency.Name = currencyInput.Name;
            currency.Code = currencyInput.Code;
            currency.Symbol = currencyInput.Symbol;
            currency.IsActive = currencyInput.IsActive;

            await _context.SaveChangesAsync();
            return Ok(currency);
        }

        // DELETE: api/currencies/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin_demo")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency == null) return NotFound();

            _context.Currencies.Remove(currency);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
