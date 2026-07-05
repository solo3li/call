using System;

namespace FoodRMS.Api.DTOs.Auth
{
    public class RegisterRequest
    {
        public string RestaurantName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Guid? PlanId { get; set; }
    }
}
