using System;

namespace FoodRMS.Api.DTOs.Staff
{
    public class StaffDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int OrdersHandled { get; set; }
        public double Rating { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string? EmployeeCode { get; set; }
        public string? MobileNumber { get; set; }
        /// <summary>Whether this employee has FoodRMS TOTP configured.</summary>
        public bool HasTotp { get; set; }

        /// <summary>
        /// Base64 QR code data URI — only present immediately after creation.
        /// Not returned on subsequent GET requests for security.
        /// </summary>
        public string? QrCodeDataUri { get; set; }
    }
}
