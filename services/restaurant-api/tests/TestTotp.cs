using System;
using OtpNet;

class Program
{
    private const string AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    
    static void Main()
    {
        var secretKey = "JBSWY3DPEBLW64TMMQQQ====";
        var step = 123456789L;
        
        var keyBytes = Base32Encoding.ToBytes(secretKey);
        var stepBytes = BitConverter.GetBytes(step);
        if (BitConverter.IsLittleEndian) Array.Reverse(stepBytes);

        using (var hmac = new System.Security.Cryptography.HMACSHA1(keyBytes))
        {
            var hash = hmac.ComputeHash(stepBytes);
            
            var result = new char[10];
            for (int i = 0; i < 10; i++)
            {
                int offset = (i * 2) % (hash.Length - 1);
                int val = (hash[offset] << 8 | hash[offset + 1]) & 0x7FFF;
                result[i] = AlphanumericChars[val % AlphanumericChars.Length];
            }
            Console.WriteLine(new string(result));
        }
    }
}
