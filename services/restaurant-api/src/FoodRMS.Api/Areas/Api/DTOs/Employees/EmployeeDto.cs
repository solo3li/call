using System;
using System.Collections.Generic;

namespace FoodRMS.Api.DTOs.Employees
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? MobileNumber { get; set; }
        public Guid? DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public string Status { get; set; } = string.Empty;
        public string? EmployeeCode { get; set; }
        public bool IsDelivery { get; set; }

        /// <summary>
        /// Base64-encoded PNG QR code data URI for FoodRMS TOTP setup.
        /// Only returned on employee creation — not stored or returned on subsequent GET requests.
        /// </summary>
        public string? QrCodeDataUri { get; set; }

        /// <summary>
        /// Whether this employee has TOTP configured.
        /// </summary>
        public bool HasTotp { get; set; }
    }

    public class CreateEmployeeRequest
    {
        public string FullName { get; set; } = string.Empty;
        
        /// <summary>Required — used as the account contact and for the TOTP QR code label.</summary>
        public string? MobileNumber { get; set; }
        
        public string EmployeeCode { get; set; } = string.Empty;
        public bool IsDelivery { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? BranchId { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class UpdateEmployeeRolesRequest
    {
        public Guid? DepartmentId { get; set; }
        public Guid? BranchId { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}
