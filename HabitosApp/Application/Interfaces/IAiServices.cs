using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IAiService
    {
        Task<RespuestaIADto> enviarMensaje(int usuarioId, PreguntaIADto dto);
        Task<List<MensajeIADto>> obtenerHistorial(int usuarioId);
        Task<CategorizacionDto> categorizarHabito(string nombreHabito);
        Task<string> generarResumenSemanal(int usuarioId);
        Task limpiarHistorial(int usuarioId);
    }
}