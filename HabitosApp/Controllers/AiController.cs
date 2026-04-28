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
        private readonly INotificacionService _notificacionService;

        public AiController(IAiService aiService, INotificacionService notificacionService)
        {
            _aiService = aiService;
            _notificacionService = notificacionService;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] PreguntaIADto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.mensaje))
                {
                    Console.WriteLine("[ERROR] DTO nulo o mensaje vacío");
                    return BadRequest(new { mensaje = "El mensaje no puede estar vacío" });
                }

                Console.WriteLine($"[DEBUG] Recibiendo mensaje de usuario {obtenerUsuarioId()}: {dto.mensaje}");
                var respuesta = await _aiService.enviarMensaje(obtenerUsuarioId(), dto);
                Console.WriteLine($"[DEBUG] Respuesta generada exitosamente");
                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error en chat: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[ERROR] Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { mensaje = $"Error interno: {ex.Message}" });
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

        [HttpPost("enviar-notificacion")]
        public async Task<IActionResult> EnviarNotificacion([FromBody] EnviarNotificacionDto dto)
        {
            try
            {
                await _notificacionService.enviarRecordatorio(obtenerUsuarioId(), dto.mensaje);
                return Ok(new { mensaje = "Notificación enviada correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}