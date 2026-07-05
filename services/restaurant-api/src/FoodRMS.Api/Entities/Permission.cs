using System;
using System.Collections.Generic;

namespace FoodRMS.Api.Entities
{
    public class Permission
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty; // e.g. "Orders.View"
        public string Group { get; set; } = string.Empty; // e.g. "Orders"
        
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
