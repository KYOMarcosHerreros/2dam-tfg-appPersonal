using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IHabitoService
    {
        Task<List<HabitoDto>> obtenerHabitosUsuario(int usuarioId);
        Task<HabitoDto> obtenerHabitoPorId(int habitoId, int usuarioId);
        Task<HabitoDto> crearHabitoCatalogo(int usuarioId, CrearHabitoDto dto);
        Task<HabitoDto> crearHabitoPersonalizado(int usuarioId, CrearHabitoDto dto);
        Task<HabitoDto> crearHabitoPersonalizadoConIA(int usuarioId, CrearHabitoPersonalizadoDto dto);
        Task<SugerenciaCategorizacionDto> sugerirCategorizacion(string nombreHabito, string descripcion);
        Task<HabitoDto> actualizarHabito(int habitoId, int usuarioId, ActualizarHabitoDto dto);
        Task eliminarHabito(int habitoId, int usuarioId);
        Task<List<CategoriaDto>> obtenerCategorias();
    }
}