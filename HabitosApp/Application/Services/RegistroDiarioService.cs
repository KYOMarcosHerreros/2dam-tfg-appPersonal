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

            if (racha == null)
            {
                Console.WriteLine($"[ERROR] No se encontró racha para hábito {habitoId}");
                return;
            }

            Console.WriteLine($"[DEBUG] ===== ACTUALIZANDO RACHA =====");
            Console.WriteLine($"[DEBUG] Hábito ID: {habitoId}");
            Console.WriteLine($"[DEBUG] Fecha actual: {fecha}");
            Console.WriteLine($"[DEBUG] Completado: {completado}");
            Console.WriteLine($"[DEBUG] Racha antes - Actual: {racha.DiasActual}, Record: {racha.DiasRecord}");

            // Obtener todos los registros completados del hábito, ordenados por fecha
            var registrosCompletados = await _contexto.RegistrosDiarios
                .Where(r => r.HabitoId == habitoId && r.Completado)
                .OrderBy(r => r.Fecha)
                .Select(r => r.Fecha)
                .Distinct()
                .ToListAsync();

            Console.WriteLine($"[DEBUG] Total de días completados en BD: {registrosCompletados.Count}");
            if (registrosCompletados.Count > 0)
            {
                Console.WriteLine($"[DEBUG] Primer día: {registrosCompletados.First()}");
                Console.WriteLine($"[DEBUG] Último día: {registrosCompletados.Last()}");
                Console.WriteLine($"[DEBUG] Fechas: {string.Join(", ", registrosCompletados.Take(10))}");
            }

            if (registrosCompletados.Count == 0)
            {
                // No hay registros completados
                racha.DiasActual = 0;
                racha.FechaInicioActual = fecha;
                racha.FechaUltimoRegistro = fecha;
                Console.WriteLine($"[DEBUG] No hay registros completados, racha = 0");
            }
            else
            {
                // Calcular la racha actual (días consecutivos hasta hoy o la fecha más reciente)
                var fechaMasReciente = registrosCompletados.Max();
                var rachaActual = 0;
                var fechaActual = fechaMasReciente;
                var fechaInicioRacha = fechaMasReciente;

                Console.WriteLine($"[DEBUG] Calculando racha desde: {fechaMasReciente}");

                // Contar hacia atrás desde la fecha más reciente
                while (registrosCompletados.Contains(fechaActual))
                {
                    rachaActual++;
                    fechaInicioRacha = fechaActual;
                    Console.WriteLine($"[DEBUG] Día {rachaActual}: {fechaActual}");
                    fechaActual = fechaActual.AddDays(-1);
                }

                Console.WriteLine($"[DEBUG] Racha actual calculada: {rachaActual} días (desde {fechaInicioRacha} hasta {fechaMasReciente})");

                // Calcular la racha más larga histórica
                var rachaMaxima = 0;
                var rachaTemp = 0;
                DateOnly? fechaAnterior = null;

                foreach (var fechaRegistro in registrosCompletados)
                {
                    if (fechaAnterior == null || fechaRegistro.DayNumber - fechaAnterior.Value.DayNumber == 1)
                    {
                        rachaTemp++;
                    }
                    else
                    {
                        rachaMaxima = Math.Max(rachaMaxima, rachaTemp);
                        rachaTemp = 1;
                    }
                    fechaAnterior = fechaRegistro;
                }
                rachaMaxima = Math.Max(rachaMaxima, rachaTemp);

                Console.WriteLine($"[DEBUG] Racha máxima histórica: {rachaMaxima} días");

                // Actualizar la racha
                racha.DiasActual = rachaActual;
                racha.DiasRecord = Math.Max(racha.DiasRecord, rachaMaxima);
                racha.FechaInicioActual = fechaInicioRacha;
                racha.FechaUltimoRegistro = fechaMasReciente;

                Console.WriteLine($"[DEBUG] Racha después - Actual: {racha.DiasActual}, Record: {racha.DiasRecord}");
            }

            await _contexto.SaveChangesAsync();
            Console.WriteLine($"[DEBUG] ===== RACHA GUARDADA =====");
        }
    }
}