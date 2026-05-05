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
        private readonly IVerificacionEmailService _verificacionEmailService;

        public AuthService(AppDbContext contexto, IConfiguration configuracion, IVerificacionEmailService verificacionEmailService)
        {
            _contexto = contexto;
            _configuracion = configuracion;
            _verificacionEmailService = verificacionEmailService;
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
                FechaRegistro = DateTime.UtcNow,
                EmailVerificado = false // Inicialmente no verificado
            };

            _contexto.Usuarios.Add(nuevoUsuario);
            await _contexto.SaveChangesAsync();

            Console.WriteLine($"✅ Usuario registrado: {nuevoUsuario.Nombre} (ID: {nuevoUsuario.Id})");

            // Enviar email de verificación de forma asíncrona (no bloqueante)
            _ = Task.Run(async () =>
            {
                try
                {
                    Console.WriteLine($"📧 Enviando email de verificación a: {nuevoUsuario.Email}");
                    await _verificacionEmailService.solicitarVerificacionEmail(nuevoUsuario.Id);
                    Console.WriteLine($"✅ Email de verificación enviado exitosamente");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error enviando email de verificación: {ex.Message}");
                    // No afecta al registro, solo se logea el error
                }
            });

            // Devolver respuesta inmediatamente sin esperar el email
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
            // Usar la misma clave que en Program.cs
            var claveJwt = Environment.GetEnvironmentVariable("JWT_SECRET") ?? 
                          "HabitosApp_SuperSecretKey_2024_MinLength32Chars_ForProduction";
            
            var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJwt));
            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nombre)
            };

            var token = new JwtSecurityToken(
                issuer: "HabitosApp",
                audience: "HabitosAppUsuarios",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> eliminarUsuario(string email)
        {
            Console.WriteLine($"🗑️ Buscando usuario para eliminar: {email}");
            
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email);

            if (usuario == null)
            {
                Console.WriteLine($"❌ Usuario no encontrado: {email}");
                return false;
            }

            Console.WriteLine($"✅ Usuario encontrado: {usuario.Nombre} (ID: {usuario.Id})");

            // Eliminar registros relacionados primero
            var registrosDiarios = await _contexto.RegistrosDiarios
                .Where(r => r.UsuarioId == usuario.Id)
                .ToListAsync();
            
            var habitos = await _contexto.Habitos
                .Where(h => h.UsuarioId == usuario.Id)
                .ToListAsync();
            
            var notificaciones = await _contexto.Notificaciones
                .Where(n => n.UsuarioId == usuario.Id)
                .ToListAsync();
            
            var mensajesIA = await _contexto.MensajesIA
                .Where(m => m.UsuarioId == usuario.Id)
                .ToListAsync();

            Console.WriteLine($"🗑️ Eliminando datos relacionados:");
            Console.WriteLine($"  - {registrosDiarios.Count} registros diarios");
            Console.WriteLine($"  - {habitos.Count} hábitos");
            Console.WriteLine($"  - {notificaciones.Count} notificaciones");
            Console.WriteLine($"  - {mensajesIA.Count} mensajes de IA");

            // Eliminar en orden correcto (dependencias primero)
            _contexto.RegistrosDiarios.RemoveRange(registrosDiarios);
            _contexto.Habitos.RemoveRange(habitos);
            _contexto.Notificaciones.RemoveRange(notificaciones);
            _contexto.MensajesIA.RemoveRange(mensajesIA);
            _contexto.Usuarios.Remove(usuario);

            await _contexto.SaveChangesAsync();
            
            Console.WriteLine($"✅ Usuario {email} y todos sus datos eliminados correctamente");
            return true;
        }

        public async Task<List<object>> listarUsuarios()
        {
            var usuarios = await _contexto.Usuarios
                .Select(u => new {
                    u.Id,
                    u.Nombre,
                    u.Email,
                    u.FechaRegistro,
                    u.EmailVerificado,
                    u.UltimoAcceso
                })
                .OrderByDescending(u => u.FechaRegistro)
                .ToListAsync();

            return usuarios.Cast<object>().ToList();
        }
    }
}