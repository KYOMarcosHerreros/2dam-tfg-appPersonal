using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IRegistroDiarioService
    {
        Task<ResumenDiarioDto> obtenerResumenDia(int usuarioId, DateOnly fecha);
        Task<RegistroDiarioDto> marcarHabito(int usuarioId, MarcarHabitoDto dto);
        Task<List<ResumenDiarioDto>> obtenerResumenSemana(int usuarioId, DateOnly fechaInicio);
    }
}