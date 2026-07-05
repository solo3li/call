namespace FoodRMS.Api.Interfaces
{
    public interface ITwoFactorService
    {
        string GenerateSecretKey();
        string GetQrCodeDataUri(string email, string secretKey, string issuer);
        bool ValidateToken(string secretKey, string token);
    }
}
