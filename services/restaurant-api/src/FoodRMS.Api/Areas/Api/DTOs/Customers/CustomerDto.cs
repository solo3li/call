using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Customers
{
    public class CustomerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<CustomerAddressDto> CustomerAddresses { get; set; } = new();
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime? LastVisit { get; set; }
    }
}
