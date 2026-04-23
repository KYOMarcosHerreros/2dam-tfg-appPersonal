using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Domain.Enums;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HabitosApp.Application.Services
{
    public class HabitoService : IHabitoService
    {
        private readonly AppDbContext _contexto;

        public HabitoService(AppDbContext contexto)
        {
            _contexto = contexto;
        }

        public async Task<List<HabitoDto>> obtenerHabitosUsuario(int usuarioId)
        {
            return await _contexto.Habitos
                .Include(h => h.Categoria)
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .Select(h => mapearHabitoDto(h))
                .ToListAsync();
        }

        public async Task<HabitoDto> obtenerHabitoPorId(int habitoId, int usuarioId)
        {
            var habito = await _contexto.Habitos
                .Include(h => h.Categoria)
                .FirstOrDefaultAsync(h => h.Id == habitoId && h.UsuarioId == usuarioId);

            if (habito == null)
                throw new Exception("Hábito no encontrado");

            return mapearHabitoDto(habito);
        }

        public async Task<HabitoDto> crearHabitoCatalogo(int usuarioId, CrearHabitoDto dto)
        {
            var habito = new Habito
            {
                UsuarioId = usuarioId,
                Nombre = dto.nombre,
                Descripcion = dto.descripcion,
                Icono = dto.icono,
                FrecuenciaSemanal = dto.frecuenciaSemanal,
                EsNegativo = dto.esNegativo,
                CategoriaId = dto.categoriaId,
                TipoHabito = TipoHabito.Catalogo,
                EsPersonalizado = false,
                EstaActivo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _contexto.Habitos.Add(habito);
            await _contexto.SaveChangesAsync();
            await crearRachaInicial(habito.Id);

            return await obtenerHabitoPorId(habito.Id, usuarioId);
        }

        public async Task<HabitoDto> crearHabitoPersonalizado(int usuarioId, CrearHabitoDto dto)
        {
            var habito = new Habito
            {
                UsuarioId = usuarioId,
                Nombre = dto.nombre,
                Descripcion = dto.descripcion,
                Icono = dto.icono,
                FrecuenciaSemanal = dto.frecuenciaSemanal,
                EsNegativo = dto.esNegativo,
                TipoHabito = TipoHabito.Personalizado,
                EsPersonalizado = true,
                EstaActivo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _contexto.Habitos.Add(habito);
            await _contexto.SaveChangesAsync();
            await crearRachaInicial(habito.Id);

            return await obtenerHabitoPorId(habito.Id, usuarioId);
        }

        public async Task<HabitoDto> actualizarHabito(int habitoId, int usuarioId, ActualizarHabitoDto dto)
        {
            var habito = await _contexto.Habitos
                .FirstOrDefaultAsync(h => h.Id == habitoId && h.UsuarioId == usuarioId);

            if (habito == null)
                throw new Exception("Hábito no encontrado");

            habito.Nombre = dto.nombre;
            habito.Descripcion = dto.descripcion;
            habito.Icono = dto.icono;
            habito.FrecuenciaSemanal = dto.frecuenciaSemanal;
            habito.EsNegativo = dto.esNegativo;

            await _contexto.SaveChangesAsync();

            return await obtenerHabitoPorId(habitoId, usuarioId);
        }

        public async Task eliminarHabito(int habitoId, int usuarioId)
        {
            var habito = await _contexto.Habitos
                .FirstOrDefaultAsync(h => h.Id == habitoId && h.UsuarioId == usuarioId);

            if (habito == null)
                throw new Exception("Hábito no encontrado");

            habito.EstaActivo = false;
            await _contexto.SaveChangesAsync();
        }

        public async Task<List<CategoriaDto>> obtenerCategorias()
        {
            return await _contexto.Categorias
                .Select(c => new CategoriaDto
                {
                    Id = c.Id,
                    nombre = c.Nombre,
                    descripcion = c.Descripcion,
                    icono = c.Icono,
                    color = c.Color
                })
                .ToListAsync();
        }

        private async Task crearRachaInicial(int habitoId)
        {
            var racha = new Racha
            {
                HabitoId = habitoId,
                DiasActual = 0,
                DiasRecord = 0,
                FechaInicioActual = DateOnly.FromDateTime(DateTime.UtcNow),
                FechaUltimoRegistro = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            _contexto.Rachas.Add(racha);
            await _contexto.SaveChangesAsync();
        }

        private static HabitoDto mapearHabitoDto(Habito h) => new HabitoDto
        {
            Id = h.Id,
            nombre = h.Nombre,
            descripcion = h.Descripcion,
            icono = h.Icono,
            tipoHabito = h.TipoHabito.ToString(),
            frecuenciaSemanal = h.FrecuenciaSemanal,
            esPersonalizado = h.EsPersonalizado,
            esNegativo = h.EsNegativo,
            estaActivo = h.EstaActivo,
            categoriaId = h.CategoriaId,
            categoriaNombre = h.Categoria?.Nombre,
            fechaCreacion = h.FechaCreacion
        };
    }
}