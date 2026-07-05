using System;

namespace FoodRMS.Api.DTOs.Branches
{
    public class BranchDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int OrdersCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
