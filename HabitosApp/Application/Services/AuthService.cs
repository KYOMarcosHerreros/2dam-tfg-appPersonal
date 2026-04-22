using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HabitosApp.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _contexto;
        private readonly IConfiguration _configuracion;

        public AuthService(AppDbContext contexto, IConfiguration configuracion)
        {
            _contexto = contexto;
            _configuracion = configuracion;
        }

        public async Task<RespuestaAuthDto> registrar(RegistroDto dto)
        {
            bool emailExiste = await _contexto.Usuarios
                .AnyAsync(u => u.Email == dto.Email);

            if (emailExiste)
                throw new Exception("El email ya está registrado");

            var nuevoUsuario = new Usuario
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FechaRegistro = DateTime.UtcNow
            };

            _contexto.Usuarios.Add(nuevoUsuario);
            await _contexto.SaveChangesAsync();

            return new RespuestaAuthDto
            {
                Token = generarToken(nuevoUsuario),
                Nombre = nuevoUsuario.Nombre,
                Email = nuevoUsuario.Email
            };
        }

        public async Task<RespuestaAuthDto> login(LoginDto dto)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
                throw new Exception("Email o contraseña incorrectos");

            usuario.UltimoAcceso = DateTime.UtcNow;
            await _contexto.SaveChangesAsync();

            return new RespuestaAuthDto
            {
                Token = generarToken(usuario),
                Nombre = usuario.Nombre,
                Email = usuario.Email
            };
        }

        private string generarToken(Usuario usuario)
        {
            var clave = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuracion["Jwt:clave"]!));

            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nombre)
            };

            var token = new JwtSecurityToken(
                issuer: _configuracion["Jwt:emisor"],
                audience: _configuracion["Jwt:audiencia"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    double.Parse(_configuracion["Jwt:expiracionHoras"]!)),
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}