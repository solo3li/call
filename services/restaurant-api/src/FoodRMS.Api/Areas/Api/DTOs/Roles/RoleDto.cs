using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Roles
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }

    public class CreateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }

    public class PermissionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
    }
}
