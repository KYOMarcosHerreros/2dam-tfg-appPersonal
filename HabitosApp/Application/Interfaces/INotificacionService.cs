using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface INotificacionService
    {
        Task<List<NotificacionDto>> obtenerNotificaciones(int usuarioId);
        Task marcarComoLeida(int notificacionId, int usuarioId);
        Task marcarTodasComoLeidas(int usuarioId);
        Task enviarRecordatorio(int usuarioId, string mensaje);
        Task verificarInactividad();
    }
}