using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Auth;

namespace FoodRMS.IntegrationTests
{
    public static class TestAuthHelper
    {
        public static async Task<string> GetTokenAsync(HttpClient client)
        {
            var request = new LoginRequest { Email = "admin@foodrms.com", Password = "Admin123!" };
            var response = await client.PostAsJsonAsync("/api/auth/login", request);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            return result!.Token;
        }
    }
}
