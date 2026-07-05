using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Staff;

namespace FoodRMS.Api.Interfaces
{
    public interface IStaffService
    {
        Task<List<StaffDto>> GetAllAsync();
        Task<StaffDto?> CreateAsync(StaffDto dto, string password);
        Task<StaffDto?> UpdateAsync(Guid id, StaffDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
