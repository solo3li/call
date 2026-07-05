using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Customers;
using Microsoft.EntityFrameworkCore;

using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly FoodRMSDbContext _context;

        public CustomerService(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<List<CustomerDto>> GetAllAsync()
        {
            return await _context.Customers
                .Include(c => c.CustomerAddresses)
                .ThenInclude(ca => ca.DeliveryZone)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    PhoneNumber = c.PhoneNumber,
                    CustomerAddresses = c.CustomerAddresses.Select(ca => new CustomerAddressDto
                    {
                        Id = ca.Id,
                        AddressDetails = ca.AddressDetails,
                        Latitude = ca.Latitude,
                        Longitude = ca.Longitude,
                        DeliveryZoneId = ca.DeliveryZoneId,
                        DeliveryZoneName = ca.DeliveryZone != null ? ca.DeliveryZone.Name : null,
                        DeliveryCost = ca.DeliveryZone != null ? (decimal?)ca.DeliveryZone.DeliveryCost : null
                    }).ToList(),
                    TotalOrders = c.Orders.Count,
                    TotalSpent = c.Orders.Sum(o => o.TotalAmount),
                    LastVisit = c.Orders.OrderByDescending(o => o.CreatedAt).Select(o => (DateTime?)o.CreatedAt).FirstOrDefault()
                }).ToListAsync();
        }

        public async Task<CustomerDto> CreateAsync(CustomerDto dto)
        {
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                PhoneNumber = dto.PhoneNumber,
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            if (dto.CustomerAddresses != null && dto.CustomerAddresses.Any())
            {
                foreach (var addrDto in dto.CustomerAddresses)
                {
                    _context.CustomerAddresses.Add(new CustomerAddress
                    {
                        CustomerId = customer.Id,
                        AddressDetails = addrDto.AddressDetails,
                        Latitude = addrDto.Latitude,
                        Longitude = addrDto.Longitude,
                        DeliveryZoneId = addrDto.DeliveryZoneId
                    });
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = customer.Id;
            return dto;
        }

        public async Task<CustomerDto?> UpdateAsync(Guid id, CustomerDto dto)
        {
            var customer = await _context.Customers.Include(c => c.CustomerAddresses).FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null) return null;

            customer.Name = dto.Name;
            customer.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
