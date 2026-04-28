using HabitosApp.Application.DTOs;
using HabitosApp.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HabitosApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PerfilController : ControllerBase
    {
        private readonly AppDbContext _contexto;

        public PerfilController(AppDbContext contexto)
        {
            _contexto = contexto;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> ObtenerPerfil()
        {
            try
            {
                var usuario = await _contexto.Usuarios
                    .FirstOrDefaultAsync(u => u.Id == obtenerUsuarioId());

                if (usuario == null)
                    return NotFound(new { mensaje = "Usuario no encontrado" });

                var perfil = new PerfilDto
                {
                    id = usuario.Id,
                    nombre = usuario.Nombre,
                    email = usuario.Email,
                    telefono = usuario.Telefono,
                    fotoPerfil = usuario.FotoPerfil,
                    notificacionesEmail = usuario.NotificacionesEmail,
                    notificacionesPush = usuario.NotificacionesPush,
                    emailVerificado = usuario.EmailVerificado, // Nuevo campo
                    fechaRegistro = usuario.FechaRegistro
                };

                return Ok(perfil);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilDto dto)
        {
            try
            {
                var usuario = await _contexto.Usuarios
                    .FirstOrDefaultAsync(u => u.Id == obtenerUsuarioId());

                if (usuario == null)
                    return NotFound(new { mensaje = "Usuario no encontrado" });

                // Verificar si el email ya está en uso por otro usuario
                if (dto.email != usuario.Email)
                {
                    var emailExiste = await _contexto.Usuarios
                        .AnyAsync(u => u.Email == dto.email && u.Id != usuario.Id);

                    if (emailExiste)
                        return BadRequest(new { mensaje = "El email ya está en uso" });
                }

                usuario.Nombre = dto.nombre;
                usuario.Email = dto.email;
                usuario.Telefono = dto.telefono;
                usuario.FotoPerfil = dto.fotoPerfil;
                usuario.NotificacionesEmail = dto.notificacionesEmail;
                usuario.NotificacionesPush = dto.notificacionesPush;

                await _contexto.SaveChangesAsync();

                return Ok(new { mensaje = "Perfil actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}
