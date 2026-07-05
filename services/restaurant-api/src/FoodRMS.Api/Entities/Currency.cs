using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Entities
{
    public class Currency
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g. "US Dollar", "ريال سعودي"
        public string Code { get; set; } = string.Empty; // e.g. "USD", "SAR"
        public string Symbol { get; set; } = string.Empty; // e.g. "$", "ر.س"
        public bool IsActive { get; set; } = true;
        
        public ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();
    }
}
