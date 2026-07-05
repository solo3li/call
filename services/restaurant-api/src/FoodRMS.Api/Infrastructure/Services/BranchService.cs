using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Branches;
using Microsoft.EntityFrameworkCore;

using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class BranchService : IBranchService
    {
        private readonly FoodRMSDbContext _context;

        public BranchService(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<List<BranchDto>> GetAllAsync()
        {
            return await _context.Branches
                .Select(b => new BranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Address = b.Address,
                    Status = b.Status,
                    Rating = b.Rating,
                    OrdersCount = b.Orders.Count,
                    Revenue = b.Orders.Sum(o => o.TotalAmount)
                }).ToListAsync();
        }

        public async Task<BranchDto> CreateAsync(BranchDto dto)
        {
            var tenantId = _context.CurrentTenantId;
            var tenant = await _context.Tenants.Include(t => t.Plan).FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant?.Plan != null)
            {
                var currentBranches = await _context.Branches.CountAsync(b => b.TenantId == tenantId);
                if (currentBranches >= tenant.Plan.MaxBranches)
                {
                    throw new InvalidOperationException($"You have reached the maximum number of branches ({tenant.Plan.MaxBranches}) allowed in your plan.");
                }
            }

            var branch = new Branch
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address,
                Status = dto.Status,
                Rating = dto.Rating
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            dto.Id = branch.Id;
            return dto;
        }

        public async Task<BranchDto?> UpdateAsync(Guid id, BranchDto dto)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return null;

            branch.Name = dto.Name;
            branch.Address = dto.Address;
            branch.Status = dto.Status;
            branch.Rating = dto.Rating;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return false;

            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
