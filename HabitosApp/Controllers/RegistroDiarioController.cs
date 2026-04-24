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
    public class RegistroDiarioController : ControllerBase
    {
        private readonly IRegistroDiarioService _registroService;

        public RegistroDiarioController(IRegistroDiarioService registroService)
        {
            _registroService = registroService;
        }

        private int obtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("{fecha}")]
        public async Task<IActionResult> ObtenerResumenDia(DateOnly fecha)
        {
            try
            {
                var resumen = await _registroService.obtenerResumenDia(obtenerUsuarioId(), fecha);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("semana/{fechaInicio}")]
        public async Task<IActionResult> ObtenerResumenSemana(DateOnly fechaInicio)
        {
            try
            {
                var resumen = await _registroService.obtenerResumenSemana(obtenerUsuarioId(), fechaInicio);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("marcar")]
        public async Task<IActionResult> MarcarHabito([FromBody] MarcarHabitoDto dto)
        {
            try
            {
                var registro = await _registroService.marcarHabito(obtenerUsuarioId(), dto);
                return Ok(registro);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}