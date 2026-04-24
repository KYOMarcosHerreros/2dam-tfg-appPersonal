using HabitosApp.Application.Interfaces;
using HabitosApp.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HabitosApp.Infrastructure.Jobs
{
    public class InactividadJob : BackgroundService
    {
        private readonly IServiceProvider _servicios;
        private readonly ILogger<InactividadJob> _logger;

        public InactividadJob(IServiceProvider servicios, ILogger<InactividadJob> logger)
        {
            _servicios = servicios;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Ejecutando verificación de inactividad: {hora}", DateTime.Now);

                    using var scope = _servicios.CreateScope();
                    var notificacionService = scope.ServiceProvider
                        .GetRequiredService<INotificacionService>();

                    await notificacionService.verificarInactividad();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error en el job de inactividad");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}