using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Entities
{
    public class Plan
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int MaxBranches { get; set; }
        public int MaxEmployees { get; set; }
        public bool IsCustom { get; set; }

        public ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();
    }
}
