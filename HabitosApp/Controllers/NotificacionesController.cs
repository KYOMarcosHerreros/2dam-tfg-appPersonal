using HabitosApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
	}
}