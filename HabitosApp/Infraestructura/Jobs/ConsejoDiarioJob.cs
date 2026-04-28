using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HabitosApp.Infrastructure.Jobs
{
    public class ConsejoDiarioJob : BackgroundService
    {
        private readonly IServiceProvider _servicios;
        private readonly ILogger<ConsejoDiarioJob> _logger;

        public ConsejoDiarioJob(IServiceProvider servicios, ILogger<ConsejoDiarioJob> logger)
        {
            _servicios = servicios;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Esperar 10 segundos antes de empezar
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Ejecutando generación de consejos diarios: {hora}", DateTime.Now);

                    using var scope = _servicios.CreateScope();
                    var contexto = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var aiService = scope.ServiceProvider.GetRequiredService<IAiService>();

                    var usuarios = await contexto.Usuarios.ToListAsync(stoppingToken);

                    foreach (var usuario in usuarios)
                    {
                        try
                        {
                            // Verificar si ya se envió un consejo hoy
                            var hoy = DateTime.UtcNow.Date;
                            var yaEnviado = await contexto.Notificaciones
                                .AnyAsync(n => n.UsuarioId == usuario.Id
                                    && n.Tipo == "consejo"
                                    && n.FechaCreacion.Date == hoy, stoppingToken);

                            if (!yaEnviado)
                            {
                                // Generar consejo personalizado
                                var consejo = await aiService.generarConsejoDiario(usuario.Id);

                                // Crear notificación
                                var notificacion = new Notificacion
                                {
                                    UsuarioId = usuario.Id,
                                    Tipo = "consejo",
                                    Mensaje = consejo,
                                    Leida = false,
                                    FechaCreacion = DateTime.UtcNow
                                };

                                contexto.Notificaciones.Add(notificacion);
                                await contexto.SaveChangesAsync(stoppingToken);

                                // Enviar email si el usuario tiene notificaciones habilitadas
                                if (usuario.NotificacionesEmail)
                                {
                                    var notificacionService = scope.ServiceProvider
                                        .GetRequiredService<INotificacionService>();
                                    
                                    await notificacionService.enviarRecordatorio(usuario.Id, 
                                        $"💡 Consejo diario de EliasHealthy: {consejo}");
                                }

                                _logger.LogInformation("Consejo enviado a usuario {usuarioId} (Email: {email})", 
                                    usuario.Id, usuario.NotificacionesEmail ? "Sí" : "No");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error generando consejo para usuario {usuarioId}", usuario.Id);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error en el job de consejos diarios");
                }

                // Ejecutar cada 24 horas
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
