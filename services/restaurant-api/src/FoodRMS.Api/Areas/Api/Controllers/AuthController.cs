using FoodRMS.Api.Interfaces;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
            }

            return Ok(response);
        }

        /// <summary>
        /// Employee login using FoodRMS TOTP TOTP code only.
        /// No email or password required — the TOTP code uniquely identifies the employee.
        /// </summary>
        [HttpPost("login-employee")]
        public async Task<ActionResult<LoginResponse>> LoginEmployee([FromBody] EmployeeTotpLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TotpCode))
            {
                return BadRequest(new { message = "رمز BoardToken مطلوب" });
            }

            var response = await _authService.LoginEmployeeByTotpAsync(request.TotpCode.Trim());
            if (response == null)
            {
                return Unauthorized(new { message = "رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى فتح تطبيق BoardToken والمحاولة مجدداً." });
            }
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                if (response == null)
                {
                    return BadRequest(new { message = "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى." });
                }

                return Ok(response);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Reset a user's password. Requires email and the new password.
        /// For production, this would require an email verification step.
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(request);
                if (!result)
                    return BadRequest(new { message = "البريد الإلكتروني غير مسجل في النظام" });

                return Ok(new { message = "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("ssl-status")]
        public async Task<IActionResult> GetSslStatus([FromQuery] string tenantId)
        {
            if (string.IsNullOrWhiteSpace(tenantId))
            {
                return BadRequest(new { message = "معرف المستأجر مطلوب" });
            }

            var isReady = await _authService.CheckSslStatusAsync(tenantId);
            return Ok(new { isReady });
        }


    }

    /// <summary>
    /// Request body for employee TOTP login.
    /// The employee opens FoodRMS TOTP and enters the 6-character rotating code.
    /// </summary>
    public class EmployeeTotpLoginRequest
    {
        /// <summary>The 6-digit/character TOTP code from FoodRMS TOTP.</summary>
        public string TotpCode { get; set; } = string.Empty;
    }
}
