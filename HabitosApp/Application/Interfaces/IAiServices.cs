using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IAiService
    {
        Task<RespuestaIADto> enviarMensaje(int usuarioId, PreguntaIADto dto);
        Task<List<MensajeIADto>> obtenerHistorial(int usuarioId);
        Task<CategorizacionDto> categorizarHabito(string nombreHabito);
        Task<string> generarResumenSemanal(int usuarioId);
        Task<string> generarConsejoDiario(int usuarioId);
        Task<string> enviarMensajeSimple(string prompt);
        Task limpiarHistorial(int usuarioId);
    }
}