using System;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Auth;

namespace FoodRMS.Api.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        Task<LoginResponse?> RegisterAsync(RegisterRequest request);
        
        /// <summary>
        /// Authenticates an employee using only their TOTP code (FoodRMS TOTP).
        /// The tenant context must be set before calling this method.
        /// </summary>
        Task<LoginResponse?> LoginEmployeeByTotpAsync(string totpCode);

        /// <summary>
        /// Resets a user's password by email. Finds the user globally across all tenant schemas.
        /// </summary>
        Task<bool> ResetPasswordAsync(ResetPasswordRequest request);

        /// <summary>
        /// Checks the ready status of the Let's Encrypt certificate for the given tenant.
        /// </summary>
        Task<bool> CheckSslStatusAsync(string tenantId);
    }
}
