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
                var estadisticas = await _estadisticasService.obtenerEstadisticasGenerales(obtenerUsuarioId());
                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
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