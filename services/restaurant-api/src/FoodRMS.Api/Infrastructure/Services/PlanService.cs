using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Plans;
using Microsoft.EntityFrameworkCore;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class PlanService : IPlanService
    {
        private readonly FoodRMSDbContext _context;

        public PlanService(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<List<PlanDto>> GetAllAsync()
        {
            return await _context.Plans
                .Select(p => new PlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    MaxBranches = p.MaxBranches,
                    MaxEmployees = p.MaxEmployees,
                    IsCustom = p.IsCustom
                }).ToListAsync();
        }

        public async Task<PlanDto?> GetByIdAsync(Guid id)
        {
            var p = await _context.Plans.FindAsync(id);
            if (p == null) return null;

            return new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                MaxBranches = p.MaxBranches,
                MaxEmployees = p.MaxEmployees,
                IsCustom = p.IsCustom
            };
        }

        public async Task<PlanDto> CreateAsync(PlanDto dto)
        {
            var plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Price = dto.Price,
                MaxBranches = dto.MaxBranches,
                MaxEmployees = dto.MaxEmployees,
                IsCustom = dto.IsCustom
            };

            _context.Plans.Add(plan);
            await _context.SaveChangesAsync();

            dto.Id = plan.Id;
            return dto;
        }

        public async Task<PlanDto?> UpdateAsync(Guid id, PlanDto dto)
        {
            var plan = await _context.Plans.FindAsync(id);
            if (plan == null) return null;

            plan.Name = dto.Name;
            plan.Price = dto.Price;
            plan.MaxBranches = dto.MaxBranches;
            plan.MaxEmployees = dto.MaxEmployees;
            plan.IsCustom = dto.IsCustom;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var plan = await _context.Plans.FindAsync(id);
            if (plan == null) return false;

            _context.Plans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
