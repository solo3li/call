using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Customers;

namespace FoodRMS.Api.Interfaces
{
    public interface ICustomerService
    {
        Task<List<CustomerDto>> GetAllAsync();
        Task<CustomerDto> CreateAsync(CustomerDto dto);
        Task<CustomerDto?> UpdateAsync(Guid id, CustomerDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
