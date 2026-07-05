using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Entities
{
    public class Department : ITenantEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<AppRole> Roles { get; set; } = new List<AppRole>();
    }
}
