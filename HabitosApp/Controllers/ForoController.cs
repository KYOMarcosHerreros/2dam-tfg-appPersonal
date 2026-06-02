using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HabitosApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ForoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ForoController(AppDbContext context)
        {
            _context = context;
        }

        private int ObtenerUsuarioId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("temas")]
        public async Task<IActionResult> GetTemas()
        {
            var temas = await _context.TemasForo
                .Include(t => t.Usuario)
                .Include(t => t.Respuestas)
                .OrderByDescending(t => t.FechaCreacion)
                .Select(t => new {
                    t.Id,
                    t.Titulo,
                    t.Contenido,
                    t.Categoria,
                    t.FechaCreacion,
                    nombreUsuario = t.Usuario.Nombre,
                    respuestasCount = t.Respuestas.Count
                })
                .ToListAsync();
            return Ok(temas);
        }

        [HttpGet("temas/{id}")]
        public async Task<IActionResult> GetTema(int id)
        {
            var tema = await _context.TemasForo
                .Include(t => t.Usuario)
                .Include(t => t.Respuestas)
                    .ThenInclude(r => r.Usuario)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tema == null) return NotFound();

            return Ok(new {
                tema.Id,
                tema.Titulo,
                tema.Contenido,
                tema.Categoria,
                tema.FechaCreacion,
                nombreUsuario = tema.Usuario.Nombre,
                respuestas = tema.Respuestas.Select(r => new {
                    r.Id,
                    r.Contenido,
                    r.FechaCreacion,
                    nombreUsuario = r.Usuario.Nombre
                }).ToList()
            });
        }

        [HttpPost("temas")]
        public async Task<IActionResult> CrearTema([FromBody] TemaForo nuevoTema)
        {
            nuevoTema.UsuarioId = ObtenerUsuarioId();
            nuevoTema.FechaCreacion = DateTime.UtcNow;
            
            _context.TemasForo.Add(nuevoTema);
            await _context.SaveChangesAsync();
            
            return Ok(nuevoTema);
        }

        [HttpPost("respuestas")]
        public async Task<IActionResult> CrearRespuesta([FromBody] RespuestaForo nuevaRespuesta)
        {
            nuevaRespuesta.UsuarioId = ObtenerUsuarioId();
            nuevaRespuesta.FechaCreacion = DateTime.UtcNow;
            
            _context.RespuestasForo.Add(nuevaRespuesta);
            await _context.SaveChangesAsync();
            
            return Ok(nuevaRespuesta);
        }
    }
}