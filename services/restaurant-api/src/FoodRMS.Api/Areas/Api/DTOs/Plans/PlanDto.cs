using System;

namespace FoodRMS.Api.DTOs.Plans
{
    public class PlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int MaxBranches { get; set; }
        public int MaxEmployees { get; set; }
        public bool IsCustom { get; set; }
    }
}
