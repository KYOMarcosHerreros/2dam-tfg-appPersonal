using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Domain.Enums;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HabitosApp.Application.Services
{
    public class HabitoService : IHabitoService
    {
        private readonly AppDbContext _contexto;
        private readonly IAiService _aiService;

        public HabitoService(AppDbContext contexto, IAiService aiService)
        {
            _contexto = contexto;
            _aiService = aiService;
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
            var categorizacion = await _aiService.categorizarHabito(dto.nombre);

            var categoria = await _contexto.Categorias
                .FirstOrDefaultAsync(c => c.Nombre == categorizacion.categoria);

            var habito = new Habito
            {
                UsuarioId = usuarioId,
                Nombre = dto.nombre,
                Descripcion = dto.descripcion,
                Icono = string.IsNullOrEmpty(dto.icono) ? categorizacion.icono : dto.icono,
                FrecuenciaSemanal = dto.frecuenciaSemanal,
                EsNegativo = dto.esNegativo,
                CategoriaId = categoria?.Id,
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

        public async Task<HabitoDto> crearHabitoPersonalizadoConIA(int usuarioId, CrearHabitoPersonalizadoDto dto)
        {
            int? categoriaId = dto.CategoriaIdSugerida;

            // Si el usuario quiere usar la IA para categorizar y no ha seleccionado una categoría específica
            if (dto.UsarCategorizacionIA && !dto.CategoriaIdSugerida.HasValue)
            {
                var sugerencia = await sugerirCategorizacion(dto.Nombre, dto.Descripcion);
                categoriaId = sugerencia.CategoriaIdSugerida;
            }

            var habito = new Habito
            {
                UsuarioId = usuarioId,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Icono = dto.Icono,
                FrecuenciaSemanal = dto.FrecuenciaSemanal,
                EsNegativo = dto.EsNegativo,
                CategoriaId = categoriaId,
                TipoHabito = (TipoHabito)dto.TipoHabito,
                EsPersonalizado = true,
                EstaActivo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _contexto.Habitos.Add(habito);
            await _contexto.SaveChangesAsync();
            await crearRachaInicial(habito.Id);

            return await obtenerHabitoPorId(habito.Id, usuarioId);
        }

        public async Task<SugerenciaCategorizacionDto> sugerirCategorizacion(string nombreHabito, string descripcion)
        {
            var categorias = await obtenerCategorias();
            
            // Crear prompt para la IA
            var categoriasTexto = string.Join("\n", categorias.Select(c => $"- ID {c.Id}: {c.nombre} ({c.descripcion})"));
            
            var prompt = $@"Analiza el siguiente hábito y sugiere la mejor categoría.

Hábito: {nombreHabito}
Descripción: {(string.IsNullOrEmpty(descripcion) ? "Sin descripción" : descripcion)}

Categorías disponibles:
{categoriasTexto}

Responde SOLO con un JSON válido (sin markdown, sin texto adicional) en este formato exacto:
{{
    ""categoriaId"": 1,
    ""confianza"": 85,
    ""razon"": ""Explicación breve"",
    ""alternativas"": [
        {{""categoriaId"": 2, ""confianza"": 60}}
    ]
}}";

            try
            {
                Console.WriteLine("[DEBUG] Solicitando categorización a IA...");
                var respuestaIA = await _aiService.enviarMensajeSimple(prompt);
                Console.WriteLine($"[DEBUG] Respuesta IA: {respuestaIA}");
                
                // Limpiar la respuesta
                var respuestaLimpia = respuestaIA.Trim();
                if (respuestaLimpia.Contains("```"))
                {
                    respuestaLimpia = respuestaLimpia
                        .Replace("```json", "")
                        .Replace("```", "")
                        .Trim();
                }
                
                var opciones = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };
                
                var respuestaJson = JsonSerializer.Deserialize<JsonElement>(respuestaLimpia, opciones);
                
                var categoriaIdSugerida = respuestaJson.GetProperty("categoriaId").GetInt32();
                var confianza = respuestaJson.GetProperty("confianza").GetDouble();
                var razon = respuestaJson.GetProperty("razon").GetString() ?? "";
                
                var categoriaSugerida = categorias.FirstOrDefault(c => c.Id == categoriaIdSugerida);
                
                // Si la categoría no existe, usar la primera disponible
                if (categoriaSugerida == null)
                {
                    Console.WriteLine($"[WARNING] Categoría ID {categoriaIdSugerida} no encontrada, usando primera categoría");
                    categoriaSugerida = categorias.First();
                    categoriaIdSugerida = categoriaSugerida.Id;
                }
                
                var sugerencia = new SugerenciaCategorizacionDto
                {
                    CategoriaIdSugerida = categoriaIdSugerida,
                    CategoriaNombre = categoriaSugerida.nombre,
                    Razon = razon,
                    Confianza = confianza,
                    AlternativasSugeridas = new List<CategoriaAlternativaDto>()
                };

                // Procesar alternativas si existen
                if (respuestaJson.TryGetProperty("alternativas", out JsonElement alternativasJson))
                {
                    foreach (var alt in alternativasJson.EnumerateArray())
                    {
                        var altCategoriaId = alt.GetProperty("categoriaId").GetInt32();
                        var altConfianza = alt.GetProperty("confianza").GetDouble();
                        var altCategoria = categorias.FirstOrDefault(c => c.Id == altCategoriaId);
                        
                        if (altCategoria != null)
                        {
                            sugerencia.AlternativasSugeridas.Add(new CategoriaAlternativaDto
                            {
                                CategoriaId = altCategoriaId,
                                Nombre = altCategoria.nombre,
                                Confianza = altConfianza
                            });
                        }
                    }
                }

                Console.WriteLine($"[DEBUG] Categorización exitosa: {categoriaSugerida.nombre} ({confianza}%)");
                return sugerencia;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error en categorización IA: {ex.Message}");
                // Si falla la IA, devolver la primera categoría disponible
                var categoriaDefault = categorias.FirstOrDefault() ?? new CategoriaDto { Id = 1, nombre = "General" };
                return new SugerenciaCategorizacionDto
                {
                    CategoriaIdSugerida = categoriaDefault.Id,
                    CategoriaNombre = categoriaDefault.nombre,
                    Razon = "Categoría asignada automáticamente (la IA no pudo procesar la solicitud)",
                    Confianza = 50,
                    AlternativasSugeridas = new List<CategoriaAlternativaDto>()
                };
            }
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