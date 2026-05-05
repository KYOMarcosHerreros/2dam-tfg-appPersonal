using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Infrastructure.Data;
using HabitosApp.Domain.Entities;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System.Security.Cryptography;
using System.Text;

namespace HabitosApp.Application.Services
{
    public class VerificacionEmailService : IVerificacionEmailService
    {
        private readonly AppDbContext _contexto;
        private readonly IConfiguration _configuracion;

        public VerificacionEmailService(AppDbContext contexto, IConfiguration configuracion)
        {
            _contexto = contexto;
            _configuracion = configuracion;
        }

        public async Task<string> solicitarVerificacionEmail(int usuarioId)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            // Generar token único
            var token = GenerarTokenSeguro();
            
            // Guardar token en la base de datos
            usuario.TokenVerificacionEmail = token;
            usuario.FechaTokenVerificacion = DateTime.UtcNow;
            await _contexto.SaveChangesAsync();

            // Enviar email de verificación de forma asíncrona sin esperar
            _ = Task.Run(async () =>
            {
                try
                {
                    Console.WriteLine($"🔥 BACKGROUND - Iniciando envío de email a {usuario.Email}");
                    await enviarEmailVerificacion(usuario.Email, usuario.Nombre, token);
                    Console.WriteLine($"✅ BACKGROUND - Email enviado exitosamente a {usuario.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ BACKGROUND - Error enviando email a {usuario.Email}: {ex.Message}");
                    Console.WriteLine($"❌ BACKGROUND - Stack trace: {ex.StackTrace}");
                }
            });

            var mensaje = usuario.EmailVerificado 
                ? "Email de re-verificación enviado correctamente" 
                : "Email de verificación enviado correctamente";
                
            return mensaje;
        }

        public async Task<bool> confirmarVerificacionEmail(int usuarioId, string token)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                return false;

            // Verificar token
            if (usuario.TokenVerificacionEmail != token)
                return false;

            // Verificar que el token no haya expirado (válido por 24 horas)
            if (usuario.FechaTokenVerificacion == null || 
                DateTime.UtcNow > usuario.FechaTokenVerificacion.Value.AddHours(24))
                return false;

            // Activar verificación
            usuario.EmailVerificado = true;
            usuario.NotificacionesEmail = true; // Activar automáticamente las notificaciones
            usuario.TokenVerificacionEmail = null; // Limpiar token
            usuario.FechaTokenVerificacion = null;

            await _contexto.SaveChangesAsync();
            return true;
        }

        public async Task<EstadoVerificacionDto> obtenerEstadoVerificacion(int usuarioId)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            return new EstadoVerificacionDto
            {
                emailVerificado = usuario.EmailVerificado,
                puedeRecibirEmails = usuario.EmailVerificado && usuario.NotificacionesEmail,
                mensaje = usuario.EmailVerificado 
                    ? "Tu email está verificado y puedes recibir notificaciones"
                    : "Debes verificar tu email para recibir notificaciones"
            };
        }

        public async Task<Usuario?> BuscarUsuarioPorToken(string token)
        {
            return await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.TokenVerificacionEmail == token);
        }

        private string GenerarTokenSeguro()
        {
            // Generar código de 6 dígitos para verificación manual
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private async Task enviarEmailVerificacion(string destinatario, string nombre, string token)
        {
            try
            {
                Console.WriteLine("📧 INICIO - Iniciando proceso de envío de email de verificación...");
                Console.WriteLine($"📧 INICIO - Destinatario: {destinatario}");
                Console.WriteLine($"📧 INICIO - Nombre: {nombre}");
                Console.WriteLine($"📧 INICIO - Token: {token}");
                Console.WriteLine("📧 VERSIÓN: 3.0 - SendGrid HTTP API (No SMTP)");
                
                // Leer configuración con fallback a variables de entorno
                var emailServidor = _configuracion["Email:servidor"];
                if (string.IsNullOrEmpty(emailServidor))
                {
                    emailServidor = Environment.GetEnvironmentVariable("EMAIL_SERVIDOR");
                    Console.WriteLine("[DEBUG] Usando EMAIL_SERVIDOR desde variable de entorno");
                }
                
                var emailPassword = _configuracion["Email:password"];
                if (string.IsNullOrEmpty(emailPassword))
                {
                    emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
                    Console.WriteLine("[DEBUG] Usando EMAIL_PASSWORD desde variable de entorno");
                }
                
                var emailNombreRemitente = _configuracion["Email:nombreRemitente"];
                if (string.IsNullOrEmpty(emailNombreRemitente))
                {
                    emailNombreRemitente = Environment.GetEnvironmentVariable("EMAIL_NOMBRE_REMITENTE");
                    Console.WriteLine("[DEBUG] Usando EMAIL_NOMBRE_REMITENTE desde variable de entorno");
                }

                Console.WriteLine($"[DEBUG] Configuración de email:");
                Console.WriteLine($"  - Servidor: {emailServidor ?? "NULL"}");
                Console.WriteLine($"  - API Key: {(string.IsNullOrEmpty(emailPassword) ? "NULL" : "SET")}");
                Console.WriteLine($"  - Nombre remitente: {emailNombreRemitente ?? "NULL"}");

                if (string.IsNullOrEmpty(emailPassword))
                {
                    Console.WriteLine($"❌ SendGrid API Key no configurada");
                    throw new Exception("SendGrid API Key no configurada");
                }

                // Detectar si es SendGrid
                bool esSendGrid = emailServidor?.Contains("sendgrid") == true;
                
                if (esSendGrid)
                {
                    Console.WriteLine("📧 Usando SendGrid HTTP API - evitando bloqueo SMTP");
                    await enviarEmailConSendGridAPI(destinatario, nombre, token, emailPassword, emailNombreRemitente);
                }
                else
                {
                    Console.WriteLine("📧 Usando SMTP tradicional");
                    await enviarEmailConSMTP(destinatario, nombre, token, emailServidor, emailPassword, emailNombreRemitente);
                }

                Console.WriteLine($"🎉 Email de verificación enviado exitosamente a {destinatario}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error enviando email de verificación: {ex.Message}");
                throw new Exception($"Error enviando email de verificación: {ex.Message}");
            }
        }

        private async Task enviarEmailConSendGridAPI(string destinatario, string nombre, string token, string apiKey, string nombreRemitente)
        {
            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var backendUrl = "https://back-production-4f9d.up.railway.app";
            var urlVerificacion = $"{backendUrl}/api/VerificacionEmail/confirmar/{token}";

            Console.WriteLine($"🔗 URL de verificación: {urlVerificacion}");

            var emailData = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[] { new { email = destinatario, name = nombre } },
                        subject = "🔐 Verificación en 2 pasos - HabitosApp"
                    }
                },
                from = new { email = "noreply@habitosapp.com", name = nombreRemitente ?? "HabitosApp" },
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
    <title>Verificación de Email - HabitosApp</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #7c6aff, #ff6ab0); padding: 30px; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px; font-weight: bold;'>
                🔐 Verificación en 2 Pasos
            </h1>
            <p style='color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;'>
                HabitosApp - Seguridad
            </p>
        </div>

        <!-- Content -->
        <div style='padding: 40px 30px;'>
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 24px;'>
                ¡Hola {nombre}! 👋
            </h2>
            
            <p style='color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;'>
                Has solicitado activar las <strong>notificaciones por email</strong> en HabitosApp. 
                Para confirmar que eres tú, necesitamos verificar tu dirección de correo.
            </p>

            <div style='text-align: center; margin: 30px 0;'>
                <a href='{urlVerificacion}' style='background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;'>
                    ✅ Verificar mi Email
                </a>
            </div>

            <p style='color: #999; font-size: 12px; margin: 20px 0 0 0;'>
                Este enlace expira en 24 horas. Si no solicitaste esta verificación, ignora este email.
            </p>
        </div>

        <!-- Footer -->
        <div style='background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;'>
            <p style='color: #666; margin: 0; font-size: 14px;'>
                Este email fue enviado por <strong>HabitosApp</strong><br>
                Sistema de verificación en 2 pasos
            </p>
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

            Console.WriteLine("📤 Enviando email via SendGrid HTTP API...");
            var response = await httpClient.PostAsync("https://api.sendgrid.com/v3/mail/send", content);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("✅ Email enviado exitosamente via HTTP API");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"❌ Error HTTP API: {response.StatusCode} - {errorContent}");
                throw new Exception($"SendGrid API Error: {response.StatusCode} - {errorContent}");
            }
        }

        private async Task enviarEmailConSMTP(string destinatario, string nombre, string token, string servidor, string password, string nombreRemitente)
        private async Task enviarEmailConSMTP(string destinatario, string nombre, string token, string servidor, string password, string nombreRemitente)
        {
            // Método SMTP original como fallback
            Console.WriteLine("⚠️ Usando SMTP - puede fallar en Railway por bloqueo de puertos");
            throw new Exception("SMTP no disponible en Railway - usar SendGrid HTTP API");
        }
    }
}