using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Branches;

namespace FoodRMS.Api.Interfaces
{
    public interface IBranchService
    {
        Task<List<BranchDto>> GetAllAsync();
        Task<BranchDto> CreateAsync(BranchDto dto);
        Task<BranchDto?> UpdateAsync(Guid id, BranchDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
