using HabitosApp.Application.DTOs;
using HabitosApp.Domain.Entities;

namespace HabitosApp.Application.Interfaces
{
    public interface IVerificacionEmailService
    {
        Task<string> solicitarVerificacionEmail(int usuarioId);
        Task<bool> confirmarVerificacionEmail(int usuarioId, string token);
        Task<EstadoVerificacionDto> obtenerEstadoVerificacion(int usuarioId);
        Task<Usuario?> BuscarUsuarioPorToken(string token);
    }
}