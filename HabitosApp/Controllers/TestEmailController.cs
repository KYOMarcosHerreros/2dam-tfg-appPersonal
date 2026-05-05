using Microsoft.AspNetCore.Mvc;
using HabitosApp.Application.Interfaces;

namespace HabitosApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestEmailController : ControllerBase
    {
        private readonly IVerificacionEmailService _verificacionEmailService;

        public TestEmailController(IVerificacionEmailService verificacionEmailService)
        {
            _verificacionEmailService = verificacionEmailService;
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
        {
            try
            {
                Console.WriteLine($"🧪 Probando envío de email a: {request.Email}");
                
                // Usar el servicio existente para probar
                var resultado = await _verificacionEmailService.solicitarVerificacionEmail(1); // Usuario ID 1 para prueba
                
                return Ok(new { 
                    mensaje = "Email de prueba enviado", 
                    destinatario = request.Email,
                    resultado = resultado
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en test de email: {ex.Message}");
                return BadRequest(new { 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }

    public class TestEmailRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}