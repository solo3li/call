using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Data;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Areas.Api.DTOs.KitchenStations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class KitchenStationsController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public KitchenStationsController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<KitchenStationDto>>> GetAll()
        {
            return await _context.KitchenStations
                .Select(s => new KitchenStationDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    BranchId = s.BranchId
                })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<KitchenStationDto>> Create(KitchenStationDto request)
        {
            var station = new KitchenStation 
            { 
                Name = request.Name,
                BranchId = request.BranchId
            };
            
            _context.KitchenStations.Add(station);
            await _context.SaveChangesAsync();
            
            request.Id = station.Id;
            return Ok(request);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, KitchenStationDto request)
        {
            var station = await _context.KitchenStations.FindAsync(id);
            if (station == null) return NotFound();
            
            station.Name = request.Name;
            station.BranchId = request.BranchId;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var station = await _context.KitchenStations.FindAsync(id);
            if (station == null) return NotFound();
            
            _context.KitchenStations.Remove(station);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
