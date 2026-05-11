using HabitosApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitosApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EstadisticasController : ControllerBase
    {
        private readonly IEstadisticasService _estadisticasService;

        public EstadisticasController(IEstadisticasService estadisticasService)
        {
            _estadisticasService = estadisticasService;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("generales")]
        public async Task<IActionResult> ObtenerEstadisticasGenerales()
        {
            try
            {
                var usuarioId = obtenerUsuarioId();
                Console.WriteLine($"[CONTROLLER] Obteniendo estadísticas generales para usuario ID: {usuarioId}");
                Console.WriteLine($"[CONTROLLER] Claims del usuario: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
                
                var estadisticas = await _estadisticasService.obtenerEstadisticasGenerales(usuarioId);
                
                Console.WriteLine($"[CONTROLLER] Estadísticas obtenidas exitosamente");
                Console.WriteLine($"[CONTROLLER] Retornando: totalHabitos={estadisticas.totalHabitos}, mejorRacha={estadisticas.mejorRacha}");
                
                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CONTROLLER] ERROR: {ex.Message}");
                Console.WriteLine($"[CONTROLLER] Stack trace: {ex.StackTrace}");
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("habitos")]
        public async Task<IActionResult> ObtenerEstadisticasPorHabito(
            [FromQuery] DateOnly fechaInicio,
            [FromQuery] DateOnly fechaFin)
        {
            try
            {
                var estadisticas = await _estadisticasService.obtenerEstadisticasPorHabito(
                    obtenerUsuarioId(), fechaInicio, fechaFin);
                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("mapa-calor")]
        public async Task<IActionResult> ObtenerMapaCalor([FromQuery] int dias = 90)
        {
            try
            {
                var mapaCalor = await _estadisticasService.obtenerMapaCalor(obtenerUsuarioId(), dias);
                return Ok(mapaCalor);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}