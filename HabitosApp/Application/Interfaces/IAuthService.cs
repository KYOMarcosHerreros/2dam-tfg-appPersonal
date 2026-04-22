using HabitosApp.Application.DTOs;

namespace HabitosApp.Application.Interfaces
{
    public interface IAuthService
    {
        Task<RespuestaAuthDto> registrar(RegistroDto dto);
        Task<RespuestaAuthDto> login(LoginDto dto);
    }
}