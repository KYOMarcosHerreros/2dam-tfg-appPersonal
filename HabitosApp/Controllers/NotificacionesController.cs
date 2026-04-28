using HabitosApp.Application.Interfaces;
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
	public class NotificacionesController : ControllerBase
	{
		private readonly INotificacionService _notificacionService;

		public NotificacionesController(INotificacionService notificacionService)
		{
			_notificacionService = notificacionService;
		}

		private int obtenerUsuarioId() =>
			int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

		[HttpGet]
		public async Task<IActionResult> ObtenerNotificaciones()
		{
			try
			{
				var notificaciones = await _notificacionService.obtenerNotificaciones(obtenerUsuarioId());
				return Ok(notificaciones);
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}

		[HttpPut("{id}/leer")]
		public async Task<IActionResult> MarcarComoLeida(int id)
		{
			try
			{
				await _notificacionService.marcarComoLeida(id, obtenerUsuarioId());
				return Ok(new { mensaje = "Notificación marcada como leída" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}

		[HttpPut("leer-todas")]
		public async Task<IActionResult> MarcarTodasComoLeidas()
		{
			try
			{
				await _notificacionService.marcarTodasComoLeidas(obtenerUsuarioId());
				return Ok(new { mensaje = "Todas las notificaciones marcadas como leídas" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}

		[HttpPost("crear-prueba")]
		public async Task<IActionResult> CrearNotificacionPrueba()
		{
			try
			{
				await _notificacionService.enviarRecordatorio(obtenerUsuarioId(), 
					"💡 Consejo de EliasHealthy: Recuerda mantener una rutina constante. La consistencia es clave para formar hábitos duraderos.");
				return Ok(new { mensaje = "Notificación de prueba creada" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}

		[HttpPost("probar-email")]
		public async Task<IActionResult> ProbarEnvioEmail()
		{
			try
			{
				await _notificacionService.enviarRecordatorio(obtenerUsuarioId(), 
					"🎉 ¡Email de prueba! Si recibes este mensaje, las notificaciones por email están funcionando correctamente. ¡Sigue construyendo tus hábitos!");
				return Ok(new { mensaje = "Email de prueba enviado. Revisa tu bandeja de entrada." });
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = $"Error enviando email: {ex.Message}" });
			}
		}

		[HttpPost("toggle-email")]
		public async Task<IActionResult> ToggleNotificacionesEmail()
		{
			try
			{
				using var scope = HttpContext.RequestServices.CreateScope();
				var contexto = scope.ServiceProvider.GetRequiredService<AppDbContext>();
				
				var usuario = await contexto.Usuarios
					.FirstOrDefaultAsync(u => u.Id == obtenerUsuarioId());

				if (usuario == null)
					return NotFound(new { mensaje = "Usuario no encontrado" });

				usuario.NotificacionesEmail = !usuario.NotificacionesEmail;
				await contexto.SaveChangesAsync();

				var estado = usuario.NotificacionesEmail ? "activadas" : "desactivadas";
				return Ok(new { 
					mensaje = $"Notificaciones por email {estado}",
					notificacionesEmail = usuario.NotificacionesEmail
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}

		[HttpDelete("eliminar/{id}")]
		public async Task<IActionResult> EliminarNotificacion(int id)
		{
			try
			{
				await _notificacionService.eliminarNotificacion(id, obtenerUsuarioId());
				return Ok(new { mensaje = "Notificación eliminada" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { mensaje = ex.Message });
			}
		}
	}
}