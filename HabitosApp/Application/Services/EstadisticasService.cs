using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HabitosApp.Application.Services
{
    public class EstadisticasService : IEstadisticasService
    {
        private readonly AppDbContext _contexto;

        public EstadisticasService(AppDbContext contexto)
        {
            _contexto = contexto;
        }

        public async Task<EstadisticasGeneralesDto> obtenerEstadisticasGenerales(int usuarioId)
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

            var habitos = await _contexto.Habitos
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .ToListAsync();

            var registrosHoy = await _contexto.RegistrosDiarios
                .Where(r => r.UsuarioId == usuarioId && r.Fecha == hoy && r.Completado)
                .ToListAsync();

            var rachas = await _contexto.Rachas
                .Where(r => r.Habito.UsuarioId == usuarioId)
                .ToListAsync();

            var fechaInicioSemana = hoy.AddDays(-6);
            var ultimos7Dias = new List<ResumenDiarioDto>();

            for (int i = 0; i < 7; i++)
            {
                var fecha = fechaInicioSemana.AddDays(i);
                var registrosDia = await _contexto.RegistrosDiarios
                    .Where(r => r.UsuarioId == usuarioId && r.Fecha == fecha)
                    .ToListAsync();

                var completados = registrosDia.Count(r => r.Completado);
                ultimos7Dias.Add(new ResumenDiarioDto
                {
                    fecha = fecha,
                    totalHabitos = habitos.Count,
                    habitosCompletados = completados,
                    porcentajeCompletado = habitos.Count > 0
                        ? Math.Round((double)completados / habitos.Count * 100, 1)
                        : 0
                });
            }

            return new EstadisticasGeneralesDto
            {
                totalHabitos = habitos.Count,
                habitosCompletadosHoy = registrosHoy.Count,
                porcentajeHoy = habitos.Count > 0
                    ? Math.Round((double)registrosHoy.Count / habitos.Count * 100, 1)
                    : 0,
                mejorRacha = rachas.Any() ? rachas.Max(r => r.DiasRecord) : 0,
                rachaActualMaxima = rachas.Any() ? rachas.Max(r => r.DiasActual) : 0,
                ultimos7Dias = ultimos7Dias
            };
        }

        public async Task<List<EstadisticaHabitoDto>> obtenerEstadisticasPorHabito(int usuarioId, DateOnly fechaInicio, DateOnly fechaFin)
        {
            var habitos = await _contexto.Habitos
                .Include(h => h.Racha)
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .ToListAsync();

            var resultado = new List<EstadisticaHabitoDto>();

            foreach (var habito in habitos)
            {
                var totalDias = fechaFin.DayNumber - fechaInicio.DayNumber + 1;
                var diasCompletados = await _contexto.RegistrosDiarios
                    .CountAsync(r => r.HabitoId == habito.Id
                        && r.Fecha >= fechaInicio
                        && r.Fecha <= fechaFin
                        && r.Completado);

                resultado.Add(new EstadisticaHabitoDto
                {
                    habitoId = habito.Id,
                    habitoNombre = habito.Nombre,
                    icono = habito.Icono,
                    totalDias = totalDias,
                    diasCompletados = diasCompletados,
                    porcentajeExito = Math.Round((double)diasCompletados / totalDias * 100, 1),
                    rachaActual = habito.Racha?.DiasActual ?? 0,
                    rachaRecord = habito.Racha?.DiasRecord ?? 0
                });
            }

            return resultado;
        }

        public async Task<List<MapaCalorDto>> obtenerMapaCalor(int usuarioId, int dias)
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var fechaInicio = hoy.AddDays(-dias);

            var habitos = await _contexto.Habitos
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .ToListAsync();

            var registros = await _contexto.RegistrosDiarios
                .Where(r => r.UsuarioId == usuarioId && r.Fecha >= fechaInicio && r.Fecha <= hoy)
                .ToListAsync();

            var mapaCalor = new List<MapaCalorDto>();

            for (int i = 0; i <= dias; i++)
            {
                var fecha = fechaInicio.AddDays(i);
                var completados = registros.Count(r => r.Fecha == fecha && r.Completado);

                mapaCalor.Add(new MapaCalorDto
                {
                    fecha = fecha,
                    habitosCompletados = completados,
                    totalHabitos = habitos.Count,
                    porcentaje = habitos.Count > 0
                        ? Math.Round((double)completados / habitos.Count * 100, 1)
                        : 0
                });
            }

            return mapaCalor;
        }
    }
}