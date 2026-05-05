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

            // Enviar email de verificación
            await enviarEmailVerificacion(usuario.Email, usuario.Nombre, token);

            return "Email de verificación enviado correctamente";
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
                Console.WriteLine("📧 Iniciando envío de email de verificación...");
                
                // Leer configuración con fallback a variables de entorno
                var emailServidor = _configuracion["Email:servidor"];
                if (string.IsNullOrEmpty(emailServidor))
                {
                    emailServidor = Environment.GetEnvironmentVariable("EMAIL_SERVIDOR");
                    Console.WriteLine("[DEBUG] Usando EMAIL_SERVIDOR desde variable de entorno");
                }
                
                var emailPuerto = _configuracion["Email:puerto"];
                if (string.IsNullOrEmpty(emailPuerto))
                {
                    emailPuerto = Environment.GetEnvironmentVariable("EMAIL_PUERTO");
                    Console.WriteLine("[DEBUG] Usando EMAIL_PUERTO desde variable de entorno");
                }
                
                var emailUsuario = _configuracion["Email:usuario"];
                if (string.IsNullOrEmpty(emailUsuario))
                {
                    emailUsuario = Environment.GetEnvironmentVariable("EMAIL_USUARIO");
                    Console.WriteLine("[DEBUG] Usando EMAIL_USUARIO desde variable de entorno");
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
                Console.WriteLine($"  - Puerto: {emailPuerto ?? "NULL"}");
                Console.WriteLine($"  - Usuario: {emailUsuario ?? "NULL"}");
                Console.WriteLine($"  - Password: {(string.IsNullOrEmpty(emailPassword) ? "NULL" : "SET")}");
                Console.WriteLine($"  - Nombre remitente: {emailNombreRemitente ?? "NULL"}");

                if (string.IsNullOrEmpty(emailServidor) || string.IsNullOrEmpty(emailUsuario) || string.IsNullOrEmpty(emailPassword))
                {
                    var error = "Configuración de email incompleta. Variables faltantes: ";
                    if (string.IsNullOrEmpty(emailServidor)) error += "EMAIL_SERVIDOR ";
                    if (string.IsNullOrEmpty(emailUsuario)) error += "EMAIL_USUARIO ";
                    if (string.IsNullOrEmpty(emailPassword)) error += "EMAIL_PASSWORD ";
                    
                    Console.WriteLine($"❌ {error}");
                    throw new Exception(error);
                }

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(
                    emailNombreRemitente ?? "HabitosApp",
                    emailUsuario));
                email.To.Add(new MailboxAddress(nombre, destinatario));
                email.Subject = "🔐 Verificación en 2 pasos - HabitosApp";

                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
                var backendUrl = "https://back-production-4f9d.up.railway.app";
                var urlVerificacion = $"{backendUrl}/api/VerificacionEmail/confirmar/{token}";

                Console.WriteLine($"🔗 URL de verificación: {urlVerificacion}");

                var htmlBody = $@"
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

            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                <p style='color: #856404; margin: 0; font-size: 14px; text-align: center;'>
                    🔒 <strong>Importante:</strong> Solo haz clic si solicitaste esta verificación
                </p>
            </div>

            <div style='text-align: center; margin: 30px 0;'>
                <a href='{urlVerificacion}' style='background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;'>
                    ✅ Verificar mi Email
                </a>
            </div>

            <div style='background-color: #f8f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;'>
                <p style='color: #666; margin: 0; font-size: 14px;'>
                    <strong>¿Qué pasará después?</strong><br>
                    • Tu email quedará verificado<br>
                    • Se activarán automáticamente las notificaciones<br>
                    • Empezarás a recibir consejos diarios de EliasHealthy<br>
                    • Recibirás recordatorios útiles para mantener tus hábitos
                </p>
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
</html>";

                var builder = new BodyBuilder();
                builder.HtmlBody = htmlBody;
                builder.TextBody = $"Verificación de email para {nombre}. Usa este enlace: {urlVerificacion}";
                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                
                Console.WriteLine($"🔌 Conectando a servidor SMTP: {emailServidor}:{emailPuerto}");
                await smtp.ConnectAsync(emailServidor, int.Parse(emailPuerto ?? "587"), SecureSocketOptions.StartTls);
                smtp.Timeout = 30000; // 30 segundos de timeout
                Console.WriteLine("✅ Conexión SMTP establecida");
                
                Console.WriteLine($"🔐 Autenticando con usuario: {emailUsuario}");
                await smtp.AuthenticateAsync(emailUsuario, emailPassword);
                Console.WriteLine("✅ Autenticación SMTP exitosa");
                
                Console.WriteLine($"📤 Enviando email a: {destinatario}");
                await smtp.SendAsync(email);
                Console.WriteLine("✅ Email enviado exitosamente");
                
                await smtp.DisconnectAsync(true);
                Console.WriteLine("🔌 Desconectado del servidor SMTP");

                Console.WriteLine($"🎉 Email de verificación enviado exitosamente a {destinatario}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error enviando email de verificación: {ex.Message}");
                throw new Exception($"Error enviando email de verificación: {ex.Message}");
            }
        }
    }
}