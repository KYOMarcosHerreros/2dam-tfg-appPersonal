using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HabitosApp.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistroDto dto)
        {
            try
            {
                Console.WriteLine($"🔥 REGISTRO - Iniciando registro para email: {dto.Email}");
                Console.WriteLine($"🔥 REGISTRO - Nombre: {dto.Nombre}");
                
                var resultado = await _authService.registrar(dto);
                
                Console.WriteLine($"🔥 REGISTRO - Registro completado exitosamente para: {dto.Email}");
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔥 REGISTRO - Error en registro: {ex.Message}");
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                Console.WriteLine($"🔥 LOGIN - Iniciando login para email: {dto.Email}");
                
                var resultado = await _authService.login(dto);
                
                Console.WriteLine($"🔥 LOGIN - Login completado exitosamente para: {dto.Email}");
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔥 LOGIN - Error en login: {ex.Message}");
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpDelete("eliminar-usuario/{email}")]
        public async Task<IActionResult> EliminarUsuario(string email)
        {
            try
            {
                Console.WriteLine($"🗑️ ELIMINAR - Iniciando eliminación para email: {email}");
                
                var resultado = await _authService.eliminarUsuario(email);
                
                Console.WriteLine($"🗑️ ELIMINAR - Usuario eliminado exitosamente: {email}");
                return Ok(new { mensaje = $"Usuario {email} eliminado correctamente", eliminado = resultado });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🗑️ ELIMINAR - Error eliminando usuario: {ex.Message}");
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> ListarUsuarios()
        {
            try
            {
                var usuarios = await _authService.listarUsuarios();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}