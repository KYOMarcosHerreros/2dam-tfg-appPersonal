using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HabitosApp.Infrastructure.Data;
using HabitosApp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace HabitosApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Protege el foro para que solo entren usuarios logueados
    public class ForoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ForoController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. OBTENER TODOS LOS TEMAS (GET /api/foro/temas)
        // ==========================================
        [HttpGet("temas")]
        public async Task<IActionResult> GetTemas([FromQuery] string ordenar = "reciente")
        {
            var query = _context.TemasForo
                .Include(t => t.Usuario)
                .Include(t => t.Respuestas)
                .AsQueryable();

            // Ordenamiento básico
            if (ordenar == "activo")
            {
                query = query.OrderByDescending(t => t.Respuestas!.Count);
            }
            else
            {
                // Por defecto o "reciente"
                query = query.OrderByDescending(t => t.FechaCreacion);
            }

            var temasDb = await query.ToListAsync();

            // Mapeamos los datos al formato exacto que pide React
            var temas = temasDb.Select(t => new
            {
                id = t.Id,
                titulo = t.Titulo,
                contenido = t.Contenido,
                categoria = new { nombre = t.Categoria, color = "#10b981" }, // Adaptado para el frontend
                fechaCreacion = t.FechaCreacion,
                nombreUsuario = t.Usuario?.Nombre ?? "Usuario Desconocido",
                vistas = 0,
                respuestas = t.Respuestas?.Select(r => new { id = r.Id }).ToList()
            });

            return Ok(temas);
        }

        // ==========================================
        // 2. OBTENER UN TEMA ESPECÍFICO (GET /api/foro/temas/{id})
        // ==========================================
        [HttpGet("temas/{id}")]
        public async Task<IActionResult> GetTema(int id)
        {
            var tema = await _context.TemasForo
                .Include(t => t.Usuario)
                .Include(t => t.Respuestas!)
                    .ThenInclude(r => r.Usuario)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tema == null) return NotFound(new { message = "El tema no existe" });

            return Ok(new
            {
                id = tema.Id,
                titulo = tema.Titulo,
                contenido = tema.Contenido,
                categoria = new { nombre = tema.Categoria, color = "#10b981" },
                fechaCreacion = tema.FechaCreacion,
                nombreUsuario = tema.Usuario?.Nombre,
                respuestas = tema.Respuestas?.Select(r => new
                {
                    id = r.Id,
                    contenido = r.Contenido,
                    fechaCreacion = r.FechaCreacion,
                    nombreUsuario = r.Usuario?.Nombre,
                    usuarioId = r.UsuarioId
                }).OrderBy(r => r.fechaCreacion).ToList()
            });
        }

        // ==========================================
        // 3. CREAR UN TEMA (POST /api/foro/temas)
        // ==========================================
        [HttpPost("temas")]
        public async Task<IActionResult> CrearTema([FromBody] TemaForo nuevoTema)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioActualId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            // Sobrescribimos con datos seguros del backend
            nuevoTema.UsuarioId = usuarioActualId;
            nuevoTema.FechaCreacion = DateTime.UtcNow;
            
            // Para evitar conflictos con Entity Framework al insertar
            nuevoTema.Id = 0; 
            nuevoTema.Usuario = null;
            nuevoTema.Respuestas = null;

            _context.TemasForo.Add(nuevoTema);
            await _context.SaveChangesAsync();

            return Ok(nuevoTema);
        }

        // ==========================================
        // 4. ELIMINAR UN TEMA (DELETE /api/foro/temas/{id})
        // ==========================================
        [HttpDelete("temas/{id}")]
        public async Task<IActionResult> EliminarTema(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioActualId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var tema = await _context.TemasForo.FindAsync(id);
            
            if (tema == null)
            {
                return NotFound(new { message = "El tema no existe" });
            }

            // REGLA DE NEGOCIO: Solo el creador puede borrarlo
            if (tema.UsuarioId != usuarioActualId)
            {
                return StatusCode(403, new { message = "No tienes permiso para eliminar este tema" });
            }

            _context.TemasForo.Remove(tema);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Tema eliminado correctamente" });
        }

        // ==========================================
        // 5. CREAR UNA RESPUESTA (POST /api/foro/respuestas)
        // ==========================================
        [HttpPost("respuestas")]
        public async Task<IActionResult> CrearRespuesta([FromBody] RespuestaForo nuevaRespuesta)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioActualId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            nuevaRespuesta.UsuarioId = usuarioActualId;
            nuevaRespuesta.FechaCreacion = DateTime.UtcNow;
            nuevaRespuesta.Id = 0;
            nuevaRespuesta.Usuario = null;
            nuevaRespuesta.TemaForo = null;

            _context.RespuestasForo.Add(nuevaRespuesta);
            await _context.SaveChangesAsync();

            return Ok(nuevaRespuesta);
        }

        // ==========================================
        // 6. ELIMINAR UNA RESPUESTA (DELETE /api/foro/respuestas/{id})
        // ==========================================
        [HttpDelete("respuestas/{id}")]
        public async Task<IActionResult> EliminarRespuesta(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioActualId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var respuesta = await _context.RespuestasForo.FindAsync(id);
            if (respuesta == null) return NotFound();

            // Solo el creador de la respuesta puede borrarla
            if (respuesta.UsuarioId != usuarioActualId)
            {
                return StatusCode(403, new { message = "No tienes permiso para eliminar esta respuesta" });
            }

            _context.RespuestasForo.Remove(respuesta);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}