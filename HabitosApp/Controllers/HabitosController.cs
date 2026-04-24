using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitosApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HabitosController : ControllerBase
    {
        private readonly IHabitoService _habitoService;
        private readonly AppDbContext _contexto;

        public HabitosController(IHabitoService habitoService, AppDbContext contexto)
        {
            _habitoService = habitoService;
            _contexto = contexto;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> ObtenerHabitos()
        {
            try
            {
                var habitos = await _habitoService.obtenerHabitosUsuario(obtenerUsuarioId());
                return Ok(habitos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerHabitoPorId(int id)
        {
            try
            {
                var habito = await _habitoService.obtenerHabitoPorId(id, obtenerUsuarioId());
                return Ok(habito);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("catalogo")]
        public async Task<IActionResult> CrearHabitoCatalogo([FromBody] CrearHabitoDto dto)
        {
            try
            {
                var habito = await _habitoService.crearHabitoCatalogo(obtenerUsuarioId(), dto);
                return Ok(habito);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("personalizado")]
        public async Task<IActionResult> CrearHabitoPersonalizado([FromBody] CrearHabitoDto dto)
        {
            try
            {
                var habito = await _habitoService.crearHabitoPersonalizado(obtenerUsuarioId(), dto);
                return Ok(habito);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarHabito(int id, [FromBody] ActualizarHabitoDto dto)
        {
            try
            {
                var habito = await _habitoService.actualizarHabito(id, obtenerUsuarioId(), dto);
                return Ok(habito);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarHabito(int id)
        {
            try
            {
                await _habitoService.eliminarHabito(id, obtenerUsuarioId());
                return Ok(new { mensaje = "Hábito eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("categorias")]
        public async Task<IActionResult> ObtenerCategorias()
        {
            try
            {
                var categorias = await _habitoService.obtenerCategorias();
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("{id}/racha")]
        public async Task<IActionResult> ObtenerRacha(int id)
        {
            try
            {
                var racha = await _contexto.Rachas
                    .Include(r => r.Habito)
                    .FirstOrDefaultAsync(r => r.HabitoId == id && r.Habito.UsuarioId == obtenerUsuarioId());

                if (racha == null)
                    return NotFound(new { mensaje = "Racha no encontrada" });

                return Ok(new RachaDto
                {
                    habitoId = racha.HabitoId,
                    habitoNombre = racha.Habito.Nombre,
                    diasActual = racha.DiasActual,
                    diasRecord = racha.DiasRecord,
                    fechaInicioActual = racha.FechaInicioActual,
                    fechaUltimoRegistro = racha.FechaUltimoRegistro
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}