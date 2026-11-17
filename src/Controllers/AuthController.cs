using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HipoPay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        
        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public record LoginRequest(string Username, string Password);

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured"));

            if (request.Username == _configuration["Admin:Username"] && request.Password == _configuration["Admin:Password"])
            {
                var claims = new[]
                {
                   new Claim(ClaimTypes.Name, request.Username),
                   new Claim(ClaimTypes.Role, "Admin")
                };

                var stringToken = CreateToken(jwtSettings, key, claims);

                return Ok(new { Token = stringToken });
            }
            else if (request.Username == _configuration["Guest:Username"] && request.Password == _configuration["Guest:Password"])
            {
                var claims = new[]
                {
                   new Claim(ClaimTypes.Name, request.Username),
                   new Claim(ClaimTypes.Role, "Guest")
                };

                var stringToken = CreateToken(jwtSettings, key, claims);

                return Ok(new { Token = stringToken });
            }
            return Unauthorized(new { message = "Invalid username or password" });
        }
        private static string CreateToken(IConfigurationSection jwtSettings, byte[] key, Claim[] claims)
        {
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}