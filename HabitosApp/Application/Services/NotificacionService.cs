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
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(
                    _configuracion["Email:nombreRemitente"],
                    _configuracion["Email:usuario"]));
                email.To.Add(new MailboxAddress(nombre, destinatario));
                email.Subject = asunto;
                email.Body = new TextPart("plain") { Text = cuerpo };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(
                    _configuracion["Email:servidor"],
                    int.Parse(_configuracion["Email:puerto"]!),
                    SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(
                    _configuracion["Email:usuario"],
                    _configuracion["Email:password"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                var notificacionEmail = await _contexto.Notificaciones
                    .OrderByDescending(n => n.FechaCreacion)
                    .FirstOrDefaultAsync();

                if (notificacionEmail != null)
                {
                    notificacionEmail.FechaEnvio = DateTime.UtcNow;
                    await _contexto.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error enviando email: {ex.Message}");
            }
        }
    }
}