using System;
using OtpNet;
using System.Security.Cryptography;

class Program {
    static void Main() {
        var secretKey = "ADMINSECRETKEY222222222222222222";
        var keyBytes = Base32Encoding.ToBytes(secretKey);
        
        var unixTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var currentStep = unixTimestamp / 3600;

        var stepBytes = BitConverter.GetBytes(currentStep);
        if (BitConverter.IsLittleEndian) Array.Reverse(stepBytes);

        using (var hmac = new HMACSHA1(keyBytes))
        {
            var hash = hmac.ComputeHash(stepBytes);
            var AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
            var result = new char[10];
            for (int i = 0; i < 10; i++)
            {
                int offset = (i * 2) % (hash.Length - 1);
                int val = (hash[offset] << 8 | hash[offset + 1]) & 0x7FFF;
                result[i] = AlphanumericChars[val % AlphanumericChars.length];
            }
            Console.WriteLine(new string(result));
        }
    }
}
