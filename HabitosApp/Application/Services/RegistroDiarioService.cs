using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HabitosApp.Application.Services
{
    public class RegistroDiarioService : IRegistroDiarioService
    {
        private readonly AppDbContext _contexto;

        public RegistroDiarioService(AppDbContext contexto)
        {
            _contexto = contexto;
        }

        public async Task<ResumenDiarioDto> obtenerResumenDia(int usuarioId, DateOnly fecha)
        {
            var habitos = await _contexto.Habitos
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .ToListAsync();

            var registros = await _contexto.RegistrosDiarios
                .Where(r => r.UsuarioId == usuarioId && r.Fecha == fecha)
                .ToListAsync();

            var listaRegistros = habitos.Select(h =>
            {
                var registro = registros.FirstOrDefault(r => r.HabitoId == h.Id);
                return new RegistroDiarioDto
                {
                    Id = registro?.Id ?? 0,
                    habitoId = h.Id,
                    habitoNombre = h.Nombre,
                    fecha = fecha,
                    completado = registro?.Completado ?? false,
                    nota = registro?.Nota
                };
            }).ToList();

            var completados = listaRegistros.Count(r => r.completado);

            return new ResumenDiarioDto
            {
                fecha = fecha,
                totalHabitos = habitos.Count,
                habitosCompletados = completados,
                porcentajeCompletado = habitos.Count > 0
                    ? Math.Round((double)completados / habitos.Count * 100, 1)
                    : 0,
                registros = listaRegistros
            };
        }

        public async Task<RegistroDiarioDto> marcarHabito(int usuarioId, MarcarHabitoDto dto)
        {
            var habito = await _contexto.Habitos
                .FirstOrDefaultAsync(h => h.Id == dto.habitoId && h.UsuarioId == usuarioId);

            if (habito == null)
                throw new Exception("Hábito no encontrado");

            var registroExistente = await _contexto.RegistrosDiarios
                .FirstOrDefaultAsync(r => r.HabitoId == dto.habitoId && r.Fecha == dto.fecha);

            if (registroExistente != null)
            {
                registroExistente.Completado = dto.completado;
                registroExistente.Nota = dto.nota;
                registroExistente.FechaRegistro = DateTime.UtcNow;
            }
            else
            {
                registroExistente = new RegistroDiario
                {
                    HabitoId = dto.habitoId,
                    UsuarioId = usuarioId,
                    Fecha = dto.fecha,
                    Completado = dto.completado,
                    Nota = dto.nota,
                    FechaRegistro = DateTime.UtcNow
                };
                _contexto.RegistrosDiarios.Add(registroExistente);
            }

            await _contexto.SaveChangesAsync();
            await actualizarRacha(dto.habitoId, dto.fecha, dto.completado);

            return new RegistroDiarioDto
            {
                Id = registroExistente.Id,
                habitoId = dto.habitoId,
                habitoNombre = habito.Nombre,
                fecha = dto.fecha,
                completado = dto.completado,
                nota = dto.nota
            };
        }

        public async Task<List<ResumenDiarioDto>> obtenerResumenSemana(int usuarioId, DateOnly fechaInicio)
        {
            var resumenes = new List<ResumenDiarioDto>();

            for (int i = 0; i < 7; i++)
            {
                var fecha = fechaInicio.AddDays(i);
                var resumen = await obtenerResumenDia(usuarioId, fecha);
                resumenes.Add(resumen);
            }

            return resumenes;
        }

        private async Task actualizarRacha(int habitoId, DateOnly fecha, bool completado)
        {
            var racha = await _contexto.Rachas
                .FirstOrDefaultAsync(r => r.HabitoId == habitoId);

            if (racha == null) return;

            if (completado)
            {
                var diasDiferencia = fecha.DayNumber - racha.FechaUltimoRegistro.DayNumber;

                if (diasDiferencia == 1)
                {
                    racha.DiasActual++;
                }
                else if (diasDiferencia > 1)
                {
                    racha.DiasActual = 1;
                    racha.FechaInicioActual = fecha;
                }

                if (racha.DiasActual > racha.DiasRecord)
                    racha.DiasRecord = racha.DiasActual;

                racha.FechaUltimoRegistro = fecha;
            }
            else
            {
                racha.DiasActual = 0;
                racha.FechaInicioActual = fecha;
            }

            await _contexto.SaveChangesAsync();
        }
    }
}