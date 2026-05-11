using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace HabitosApp.Application.Services
{
    public class NotificacionService : INotificacionService
    {
        private readonly AppDbContext _contexto;
        private readonly IConfiguration _configuracion;

        public NotificacionService(AppDbContext contexto, IConfiguration configuracion)
        {
            _contexto = contexto;
            _configuracion = configuracion;
        }

        public async Task<List<NotificacionDto>> obtenerNotificaciones(int usuarioId)
        {
            return await _contexto.Notificaciones
                .Where(n => n.UsuarioId == usuarioId)
                .OrderByDescending(n => n.FechaCreacion)
                .Select(n => new NotificacionDto
                {
                    id = n.Id,
                    tipo = n.Tipo,
                    mensaje = n.Mensaje,
                    leida = n.Leida,
                    fechaCreacion = n.FechaCreacion
                })
                .ToListAsync();
        }

        public async Task marcarComoLeida(int notificacionId, int usuarioId)
        {
            var notificacion = await _contexto.Notificaciones
                .FirstOrDefaultAsync(n => n.Id == notificacionId && n.UsuarioId == usuarioId);

            if (notificacion == null)
                throw new Exception("Notificación no encontrada");

            notificacion.Leida = true;
            await _contexto.SaveChangesAsync();
        }

        public async Task marcarTodasComoLeidas(int usuarioId)
        {
            var notificaciones = await _contexto.Notificaciones
                .Where(n => n.UsuarioId == usuarioId && !n.Leida)
                .ToListAsync();

            notificaciones.ForEach(n => n.Leida = true);
            await _contexto.SaveChangesAsync();
        }

        public async Task eliminarNotificacion(int notificacionId, int usuarioId)
        {
            var notificacion = await _contexto.Notificaciones
                .FirstOrDefaultAsync(n => n.Id == notificacionId && n.UsuarioId == usuarioId);

            if (notificacion == null)
                throw new Exception("Notificación no encontrada");

            _contexto.Notificaciones.Remove(notificacion);
            await _contexto.SaveChangesAsync();
        }

        public async Task enviarRecordatorio(int usuarioId, string mensaje)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null) return;

            var notificacion = new Notificacion
            {
                UsuarioId = usuarioId,
                Tipo = "push",
                Mensaje = mensaje,
                Leida = false,
                FechaCreacion = DateTime.UtcNow
            };

            _contexto.Notificaciones.Add(notificacion);
            await _contexto.SaveChangesAsync();

            if (usuario.NotificacionesEmail)
                await enviarEmail(usuario.Email, usuario.Nombre, "Recordatorio HabitosApp", mensaje);
        }

        public async Task verificarInactividad()
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var hace3Dias = hoy.AddDays(-3);

            var usuarios = await _contexto.Usuarios.ToListAsync();

            foreach (var usuario in usuarios)
            {
                var ultimoRegistro = await _contexto.RegistrosDiarios
                    .Where(r => r.UsuarioId == usuario.Id)
                    .OrderByDescending(r => r.Fecha)
                    .FirstOrDefaultAsync();

                if (ultimoRegistro == null || ultimoRegistro.Fecha <= hace3Dias)
                {
                    var yaNotificado = await _contexto.Notificaciones
                        .AnyAsync(n => n.UsuarioId == usuario.Id
                            && n.FechaCreacion >= DateTime.UtcNow.AddDays(-1)
                            && n.Mensaje.Contains("llevas"));

                    if (!yaNotificado)
                    {
                        var diasSinRegistro = ultimoRegistro == null ? 3
                            : hoy.DayNumber - ultimoRegistro.Fecha.DayNumber;

                        await enviarRecordatorio(usuario.Id,
                            $"¡Hola {usuario.Nombre}! Llevas {diasSinRegistro} días sin registrar tus hábitos. ¡Vuelve a la app y mantén tu racha!");
                    }
                }
            }
        }

        private async Task enviarEmail(string destinatario, string nombre, string asunto, string cuerpo)
        {
            try
            {
                Console.WriteLine("📧 NOTIFICACIÓN - Iniciando envío por email...");
                
                // Leer configuración con fallback a variables de entorno
                var emailServidor = _configuracion["Email:servidor"];
                if (string.IsNullOrEmpty(emailServidor))
                {
                    emailServidor = Environment.GetEnvironmentVariable("EMAIL_SERVIDOR");
                }
                
                var emailPassword = _configuracion["Email:password"];
                if (string.IsNullOrEmpty(emailPassword))
                {
                    emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
                }
                
                var emailNombreRemitente = _configuracion["Email:nombreRemitente"];
                if (string.IsNullOrEmpty(emailNombreRemitente))
                {
                    emailNombreRemitente = Environment.GetEnvironmentVariable("EMAIL_NOMBRE_REMITENTE");
                }

                if (string.IsNullOrEmpty(emailPassword))
                {
                    Console.WriteLine("❌ NOTIFICACIÓN - SendGrid API Key no configurada");
                    throw new Exception("SendGrid API Key no configurada");
                }

                // Detectar si es SendGrid y usar HTTP API
                bool esSendGrid = emailServidor?.Contains("sendgrid") == true;
                
                if (esSendGrid)
                {
                    Console.WriteLine("📧 NOTIFICACIÓN - Usando SendGrid HTTP API");
                    await enviarEmailConSendGridAPI(destinatario, nombre, asunto, cuerpo, emailPassword, emailNombreRemitente);
                }
                else
                {
                    Console.WriteLine("📧 NOTIFICACIÓN - Usando SMTP (puede fallar en Railway)");
                    throw new Exception("SMTP no disponible en Railway - usar SendGrid HTTP API");
                }

                Console.WriteLine($"🎉 NOTIFICACIÓN - Email enviado exitosamente a {destinatario}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ NOTIFICACIÓN - Error enviando email a {destinatario}: {ex.Message}");
                Console.WriteLine($"❌ NOTIFICACIÓN - Stack trace: {ex.StackTrace}");
            }
        }

        private async Task enviarEmailConSendGridAPI(string destinatario, string nombre, string asunto, string cuerpo, string apiKey, string nombreRemitente)
        {
            var emailData = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[] { new { email = destinatario, name = nombre } },
                        subject = asunto
                    }
                },
                from = new { email = "marcosTfgCartero@gmail.com", name = nombreRemitente ?? "HabitosApp" },
                content = new[]
                {
                    new
                    {
                        type = "text/html",
                        value = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{asunto}</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #7c6aff, #ff6ab0); padding: 30px; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px; font-weight: bold;'>
                🎯 HabitosApp
            </h1>
            <p style='color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;'>
                Tu asistente personal de hábitos
            </p>
        </div>

        <!-- Content -->
        <div style='padding: 40px 30px;'>
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 24px;'>
                ¡Hola {nombre}! 👋
            </h2>
            
            <div style='background-color: #f8f9ff; border-left: 4px solid #7c6aff; padding: 20px; margin: 20px 0; border-radius: 5px;'>
                <p style='color: #555; line-height: 1.6; margin: 0; font-size: 16px;'>
                    {cuerpo}
                </p>
            </div>

            <div style='background-color: #fff8e1; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                <p style='color: #f57c00; margin: 0; font-size: 14px; text-align: center;'>
                    💡 <strong>Consejo de EliasHealthy:</strong> La consistencia es más importante que la perfección. ¡Sigue adelante!
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style='background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;'>
            <p style='color: #666; margin: 0; font-size: 14px;'>
                Este email fue enviado por <strong>HabitosApp</strong><br>
                Si no deseas recibir más notificaciones, puedes desactivarlas en tu perfil.
            </p>
            <div style='margin-top: 15px;'>
                <span style='color: #999; font-size: 12px;'>
                    © 2024 HabitosApp - Construyendo hábitos, construyendo futuro
                </span>
            </div>
        </div>
    </div>
</body>
</html>"
                    }
                }
            };

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var json = System.Text.Json.JsonSerializer.Serialize(emailData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            Console.WriteLine("📤 NOTIFICACIÓN - Enviando via SendGrid HTTP API...");
            var response = await httpClient.PostAsync("https://api.sendgrid.com/v3/mail/send", content);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("✅ NOTIFICACIÓN - Email enviado exitosamente via HTTP API");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"❌ NOTIFICACIÓN - Error HTTP API: {response.StatusCode} - {errorContent}");
                throw new Exception($"SendGrid API Error: {response.StatusCode} - {errorContent}");
            }
        }
    }
}