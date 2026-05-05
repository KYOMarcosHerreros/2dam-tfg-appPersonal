using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitosApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerificacionEmailController : ControllerBase
    {
        private readonly IVerificacionEmailService _verificacionService;

        public VerificacionEmailController(IVerificacionEmailService verificacionService)
        {
            _verificacionService = verificacionService;
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("pong");
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { mensaje = "Controlador funcionando", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Solicita el envío de un email de verificación al usuario autenticado
        /// </summary>
        [HttpPost("solicitar")]
        [Authorize]
        public async Task<IActionResult> SolicitarVerificacion()
        {
            try
            {
                Console.WriteLine("🔥 BACKEND - Endpoint /api/VerificacionEmail/solicitar llamado");
                
                var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"🔥 BACKEND - Usuario ID del token: {usuarioIdClaim ?? "NULL"}");
                
                if (string.IsNullOrEmpty(usuarioIdClaim))
                {
                    Console.WriteLine("🔥 BACKEND - Error: No se pudo obtener el ID del usuario del token");
                    return Unauthorized(new { error = "Token inválido" });
                }
                
                var usuarioId = int.Parse(usuarioIdClaim);
                Console.WriteLine($"🔥 BACKEND - Solicitando verificación para usuario ID: {usuarioId}");
                
                var resultado = await _verificacionService.solicitarVerificacionEmail(usuarioId);
                
                Console.WriteLine($"🔥 BACKEND - Resultado del servicio: {resultado}");
                return Ok(new { mensaje = resultado });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔥 BACKEND - Error en SolicitarVerificacion: {ex.Message}");
                Console.WriteLine($"🔥 BACKEND - Stack trace: {ex.StackTrace}");
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Confirma la verificación del email usando el token recibido
        /// </summary>
        [HttpPost("confirmar")]
        [Authorize]
        public async Task<IActionResult> ConfirmarVerificacion([FromBody] ConfirmarVerificacionEmailDto dto)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
                var exito = await _verificacionService.confirmarVerificacionEmail(usuarioId, dto.token);
                
                if (exito)
                    return Ok(new { verificado = true, mensaje = "Email verificado correctamente. Las notificaciones han sido activadas." });
                else
                    return BadRequest(new { verificado = false, mensaje = "Token inválido o expirado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { verificado = false, mensaje = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint público para verificar email directamente desde el enlace del correo
        /// </summary>
        [HttpGet("confirmar/{token}")]
        public async Task<IActionResult> ConfirmarVerificacionDirecta(string token)
        {
            try
            {
                // Buscar el usuario por token
                var usuario = await _verificacionService.BuscarUsuarioPorToken(token);
                if (usuario == null)
                {
                    return Content(@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Error - HabitosApp</title>
                            <meta charset='utf-8'>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .error { color: #dc3545; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <h1 class='error'>❌ Token inválido</h1>
                                <p>El enlace de verificación no es válido o ha expirado.</p>
                                <p>Por favor, solicita un nuevo enlace de verificación desde la aplicación.</p>
                            </div>
                        </body>
                        </html>", "text/html");
                }

                var exito = await _verificacionService.confirmarVerificacionEmail(usuario.Id, token);
                
                if (exito)
                {
                    return Content(@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Verificación Exitosa - HabitosApp</title>
                            <meta charset='utf-8'>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .success { color: #28a745; }
                                .btn { background: linear-gradient(135deg, #7c6aff, #ff6ab0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <h1 class='success'>✅ Email Verificado</h1>
                                <p>¡Perfecto! Tu email ha sido verificado correctamente.</p>
                                <p>Las notificaciones por email han sido activadas automáticamente.</p>
                                <p>Ya puedes cerrar esta ventana y continuar usando HabitosApp.</p>
                                <a href='#' onclick='window.close()' class='btn'>Cerrar ventana</a>
                            </div>
                        </body>
                        </html>", "text/html");
                }
                else
                {
                    return Content(@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Error - HabitosApp</title>
                            <meta charset='utf-8'>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .error { color: #dc3545; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <h1 class='error'>❌ Error de verificación</h1>
                                <p>No se pudo verificar el email. El token puede haber expirado.</p>
                                <p>Por favor, solicita un nuevo enlace de verificación desde la aplicación.</p>
                            </div>
                        </body>
                        </html>", "text/html");
                }
            }
            catch (Exception ex)
            {
                return Content($@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Error - HabitosApp</title>
                        <meta charset='utf-8'>
                        <style>
                            body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }}
                            .container {{ background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                            .error {{ color: #dc3545; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <h1 class='error'>❌ Error del sistema</h1>
                            <p>Ocurrió un error inesperado: {ex.Message}</p>
                        </div>
                    </body>
                    </html>", "text/html");
            }
        }

        /// <summary>
        /// Obtiene el estado de verificación del email del usuario autenticado
        /// </summary>
        [HttpGet("estado")]
        [Authorize]
        public async Task<IActionResult> ObtenerEstado()
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
                var estado = await _verificacionService.obtenerEstadoVerificacion(usuarioId);
                return Ok(estado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}