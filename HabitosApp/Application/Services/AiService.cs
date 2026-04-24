using HabitosApp.Application.DTOs;
using HabitosApp.Application.Interfaces;
using HabitosApp.Domain.Entities;
using HabitosApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace HabitosApp.Application.Services
{
    public class AiService : IAiService
    {
        private readonly AppDbContext _contexto;
        private readonly IConfiguration _configuracion;
        private readonly HttpClient _httpClient;

        public AiService(AppDbContext contexto, IConfiguration configuracion, IHttpClientFactory httpClientFactory)
        {
            _contexto = contexto;
            _configuracion = configuracion;
            _httpClient = httpClientFactory.CreateClient("Groq");
        }

        public async Task<RespuestaIADto> enviarMensaje(int usuarioId, PreguntaIADto dto)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            var historialPrevio = await _contexto.MensajesIA
                .Where(m => m.UsuarioId == usuarioId)
                .OrderBy(m => m.FechaEnvio)
                .ToListAsync();

            var contextoDatos = await construirContextoUsuario(usuarioId);

            var systemPrompt = $@"Eres un asistente personal de hábitos saludables integrado en la app HabitosApp. 
Tu objetivo es ayudar al usuario a mejorar sus hábitos, motivarle y darle recomendaciones personalizadas.
Responde siempre en español, de forma cercana y motivadora.

Datos actuales del usuario {usuario.Nombre}:
{contextoDatos}

Basa tus respuestas en los datos reales del usuario cuando sea relevante.";

            var mensajes = new List<object>
            {
                new { role = "system", content = systemPrompt }
            };

            foreach (var msg in historialPrevio)
                mensajes.Add(new { role = msg.Rol, content = msg.Contenido });

            mensajes.Add(new { role = "user", content = dto.mensaje });

            var respuesta = await llamarApiGroq(mensajes);

            _contexto.MensajesIA.AddRange(
                new MensajeIA { UsuarioId = usuarioId, Rol = "user", Contenido = dto.mensaje, FechaEnvio = DateTime.UtcNow },
                new MensajeIA { UsuarioId = usuarioId, Rol = "assistant", Contenido = respuesta, FechaEnvio = DateTime.UtcNow }
            );
            await _contexto.SaveChangesAsync();

            return new RespuestaIADto
            {
                respuesta = respuesta,
                historial = await obtenerHistorial(usuarioId)
            };
        }

        public async Task<List<MensajeIADto>> obtenerHistorial(int usuarioId)
        {
            return await _contexto.MensajesIA
                .Where(m => m.UsuarioId == usuarioId)
                .OrderBy(m => m.FechaEnvio)
                .Select(m => new MensajeIADto
                {
                    rol = m.Rol,
                    contenido = m.Contenido,
                    fechaEnvio = m.FechaEnvio
                })
                .ToListAsync();
        }

        public async Task<CategorizacionDto> categorizarHabito(string nombreHabito)
        {
            var mensajes = new List<object>
            {
                new { role = "system", content = @"Eres un categorizador de hábitos. 
Responde ÚNICAMENTE con un JSON con este formato exacto sin texto adicional ni markdown:
{""categoria"":""nombre"",""icono"":""emoji"",""recomendaciones"":[""rec1"",""rec2"",""rec3""]}
Categorías posibles: Salud física, Bienestar mental, Deporte, Productividad, Cultura, Economía, Nutrición, Relaciones sociales, Otro." },
                new { role = "user", content = $"Categoriza este hábito: {nombreHabito}" }
            };

            var respuestaJson = await llamarApiGroq(mensajes);

            try
            {
                var limpio = respuestaJson.Trim();
                if (limpio.Contains("```"))
                    limpio = limpio.Replace("```json", "").Replace("```", "").Trim();

                var resultado = JsonSerializer.Deserialize<CategorizacionDto>(limpio,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return resultado ?? new CategorizacionDto { categoria = "Otro", icono = "⭐" };
            }
            catch
            {
                return new CategorizacionDto { categoria = "Otro", icono = "⭐" };
            }
        }

        public async Task<string> generarResumenSemanal(int usuarioId)
        {
            var contextoDatos = await construirContextoUsuario(usuarioId);

            var mensajes = new List<object>
            {
                new { role = "system", content = "Eres un asistente de hábitos saludables. Genera resúmenes semanales motivadores y personalizados en español, máximo 3 párrafos cortos." },
                new { role = "user", content = $"Genera mi resumen semanal con estos datos:\n{contextoDatos}" }
            };

            return await llamarApiGroq(mensajes);
        }

        public async Task limpiarHistorial(int usuarioId)
        {
            var mensajes = await _contexto.MensajesIA
                .Where(m => m.UsuarioId == usuarioId)
                .ToListAsync();

            _contexto.MensajesIA.RemoveRange(mensajes);
            await _contexto.SaveChangesAsync();
        }

        private async Task<string> construirContextoUsuario(int usuarioId)
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var hace7Dias = hoy.AddDays(-7);

            var habitos = await _contexto.Habitos
                .Include(h => h.Racha)
                .Where(h => h.UsuarioId == usuarioId && h.EstaActivo)
                .ToListAsync();

            var registros = await _contexto.RegistrosDiarios
                .Where(r => r.UsuarioId == usuarioId && r.Fecha >= hace7Dias && r.Fecha <= hoy)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine($"Hábitos activos: {habitos.Count}");

            foreach (var habito in habitos)
            {
                var completados = registros.Count(r => r.HabitoId == habito.Id && r.Completado);
                sb.AppendLine($"- {habito.Nombre}: {completados}/7 días completado, racha actual: {habito.Racha?.DiasActual ?? 0} días, récord: {habito.Racha?.DiasRecord ?? 0} días");
            }

            return sb.ToString();
        }

        private async Task<string> llamarApiGroq(List<object> mensajes)
        {
            var apiKey = _configuracion["Groq:apiKey"];
            var modelo = _configuracion["Groq:modelo"];

            var requestBody = new
            {
                model = modelo,
                max_tokens = 1024,
                messages = mensajes
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await _httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error en la API de IA: {responseString}");

            using var doc = JsonDocument.Parse(responseString);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;
        }
    }
}