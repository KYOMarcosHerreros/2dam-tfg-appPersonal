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
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] PreguntaIADto dto)
        {
            try
            {
                var respuesta = await _aiService.enviarMensaje(obtenerUsuarioId(), dto);
                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("historial")]
        public async Task<IActionResult> ObtenerHistorial()
        {
            try
            {
                var historial = await _aiService.obtenerHistorial(obtenerUsuarioId());
                return Ok(historial);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("resumen-semanal")]
        public async Task<IActionResult> GenerarResumenSemanal()
        {
            try
            {
                var resumen = await _aiService.generarResumenSemanal(obtenerUsuarioId());
                return Ok(new { resumen });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpDelete("historial")]
        public async Task<IActionResult> LimpiarHistorial()
        {
            try
            {
                await _aiService.limpiarHistorial(obtenerUsuarioId());
                return Ok(new { mensaje = "Historial limpiado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}