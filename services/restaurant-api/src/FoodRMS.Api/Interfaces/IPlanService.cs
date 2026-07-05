using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Plans;

namespace FoodRMS.Api.Interfaces
{
    public interface IPlanService
    {
        Task<List<PlanDto>> GetAllAsync();
        Task<PlanDto?> GetByIdAsync(Guid id);
        Task<PlanDto> CreateAsync(PlanDto dto);
        Task<PlanDto?> UpdateAsync(Guid id, PlanDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
