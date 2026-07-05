using System;
using FoodRMS.Api.Interfaces;
using OtpNet;
using QRCoder;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class TwoFactorService : ITwoFactorService
    {
        // TOTP period: 1 hour = 3600 seconds
        private static readonly TimeSpan TotpStep = TimeSpan.FromHours(1);
        private const string AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 characters for easy bit mapping

        public string GenerateSecretKey()
        {
            var key = KeyGeneration.GenerateRandomKey(20);
            return Base32Encoding.ToString(key);
        }

        public string GetQrCodeDataUri(string email, string secretKey, string issuer)
        {
            // Note: Standard apps like FoodRMS TOTP will NOT support 10-char alphanumeric.
            // This QR code is provided for compatibility with custom scanners or for manual setup.
            var provisionUrl = $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(email)}" +
                               $"?secret={secretKey}&issuer={Uri.EscapeDataString(issuer)}&digits=10&period=3600&encoder=alphanumeric";

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(provisionUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);

            return $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";
        }

        public bool ValidateToken(string secretKey, string token)
        {
            if (string.IsNullOrEmpty(token) || token.Length != 10) return false;

            try
            {
                var unixTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var currentStep = unixTimestamp / (int)TotpStep.TotalSeconds;

                // Check current, previous, and next step for clock drift
                for (long i = -1; i <= 1; i++)
                {
                    if (GenerateAlphanumericToken(secretKey, currentStep + i) == token.ToUpper())
                    {
                        return true;
                    }
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateAlphanumericToken(string secretKey, long step)
        {
            var keyBytes = Base32Encoding.ToBytes(secretKey);
            var stepBytes = BitConverter.GetBytes(step);
            if (BitConverter.IsLittleEndian) Array.Reverse(stepBytes);

            using (var hmac = new System.Security.Cryptography.HMACSHA1(keyBytes))
            {
                var hash = hmac.ComputeHash(stepBytes);
                
                // We need 10 characters. Each char from our 32-char set takes 5 bits.
                // 10 chars * 5 bits = 50 bits needed.
                // SHA1 gives 160 bits (20 bytes), so we have plenty.
                
                var result = new char[10];
                for (int i = 0; i < 10; i++)
                {
                    // Use a more robust mapping than simple modulo
                    // Take a 16-bit slice for each character to ensure better distribution
                    int offset = (i * 2) % (hash.Length - 1);
                    int val = (hash[offset] << 8 | hash[offset + 1]) & 0x7FFF;
                    result[i] = AlphanumericChars[val % AlphanumericChars.Length];
                }
                return new string(result);
            }
        }
    }
}
