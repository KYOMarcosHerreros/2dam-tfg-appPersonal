using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IEstadisticasService
    {
        Task<EstadisticasGeneralesDto> obtenerEstadisticasGenerales(int usuarioId);
        Task<List<EstadisticaHabitoDto>> obtenerEstadisticasPorHabito(int usuarioId, DateOnly fechaInicio, DateOnly fechaFin);
        Task<List<MapaCalorDto>> obtenerMapaCalor(int usuarioId, int dias);
    }
}