using System;
using System.Collections.Generic;
using FoodRMS.Api.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace FoodRMS.Api.Entities
{
    public class AppRole : IdentityRole<Guid>, ITenantEntity
    {
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        
        public Guid DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
        
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
