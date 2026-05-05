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
            try
            {
                Console.WriteLine($"[DEBUG] Iniciando enviarMensaje para usuario {usuarioId}");
                
                var usuario = await _contexto.Usuarios
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);

                if (usuario == null)
                {
                    Console.WriteLine($"[ERROR] Usuario {usuarioId} no encontrado");
                    throw new Exception("Usuario no encontrado");
                }

                Console.WriteLine($"[DEBUG] Usuario encontrado: {usuario.Nombre}");

                var historialPrevio = await _contexto.MensajesIA
                    .Where(m => m.UsuarioId == usuarioId)
                    .OrderBy(m => m.FechaEnvio)
                    .ToListAsync();

                Console.WriteLine($"[DEBUG] Historial previo: {historialPrevio.Count} mensajes");

                var contextoDatos = await construirContextoUsuario(usuarioId);
                Console.WriteLine($"[DEBUG] Contexto construido");

                var systemPrompt = $@"Eres EliasHealthy, un asistente personal de hábitos saludables integrado en la app HabitosApp. 

IDENTIDAD:
- Tu nombre es EliasHealthy
- Eres experto en hábitos saludables, nutrición, ejercicio y bienestar
- Cuando te presentes, di ""Soy EliasHealthy"" o ""Me llamo EliasHealthy""

REGLAS DE FORMATO:
- NO uses asteriscos (*), guiones bajos (_) ni símbolos markdown
- Cuando enumeres opciones, usa guiones simples con saltos de línea:
  - Opción 1
  - Opción 2
- Escribe en texto plano y natural

REGLAS DE LONGITUD:
- Saludos simples (hola, qué tal, etc): responde brevemente (1-2 oraciones)
- Preguntas sobre consejos, recomendaciones o explicaciones: responde de forma completa y detallada
- Análisis de hábitos: proporciona información útil y específica
- SIEMPRE completa tus respuestas, no las cortes a la mitad

TONO:
- Cercano, motivador y profesional
- Usa los datos del usuario cuando sea relevante

Datos del usuario {usuario.Nombre}:
{contextoDatos}

Responde de forma natural y útil.";

                var mensajes = new List<object>
                {
                    new { role = "system", content = systemPrompt }
                };

                foreach (var msg in historialPrevio)
                    mensajes.Add(new { role = msg.Rol, content = msg.Contenido });

                mensajes.Add(new { role = "user", content = dto.mensaje });

                Console.WriteLine($"[DEBUG] Llamando a API de Groq...");
                var respuesta = await llamarApiGroq(mensajes);
                Console.WriteLine($"[DEBUG] Respuesta recibida de Groq");

                _contexto.MensajesIA.AddRange(
                    new MensajeIA { UsuarioId = usuarioId, Rol = "user", Contenido = dto.mensaje, FechaEnvio = DateTime.UtcNow },
                    new MensajeIA { UsuarioId = usuarioId, Rol = "assistant", Contenido = respuesta, FechaEnvio = DateTime.UtcNow }
                );
                await _contexto.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] Mensajes guardados en BD");

                return new RespuestaIADto
                {
                    respuesta = respuesta,
                    historial = await obtenerHistorial(usuarioId)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error en enviarMensaje: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                throw;
            }
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

        public async Task<string> generarConsejoDiario(int usuarioId)
        {
            var contextoDatos = await construirContextoUsuario(usuarioId);

            var mensajes = new List<object>
            {
                new { role = "system", content = "Eres EliasHealthy, un asistente de hábitos saludables. Genera un consejo breve y motivador (máximo 2 oraciones) basado en los hábitos del usuario. Sé específico y práctico." },
                new { role = "user", content = $"Dame un consejo para hoy basado en estos datos:\n{contextoDatos}" }
            };

            return await llamarApiGroq(mensajes);
        }

        public async Task<string> enviarMensajeSimple(string prompt)
        {
            var mensajes = new List<object>
            {
                new { role = "user", content = prompt }
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
            try
            {
                // Leer configuración, con fallback a variables de entorno
                var apiKey = _configuracion["AI:apiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    apiKey = Environment.GetEnvironmentVariable("GROKKEY");
                    Console.WriteLine("[DEBUG] Usando GROKKEY desde variable de entorno");
                }
                
                var modelo = _configuracion["AI:modelo"] ?? "llama-3.1-8b-instant";
                var apiUrl = _configuracion["AI:apiUrl"] ?? "https://api.groq.com/openai/v1/chat/completions";

                Console.WriteLine($"[DEBUG] API Key configurada: {(!string.IsNullOrEmpty(apiKey) ? "SÍ" : "NO")}");
                Console.WriteLine($"[DEBUG] Modelo: {modelo}");
                Console.WriteLine($"[DEBUG] URL: {apiUrl}");

                if (string.IsNullOrEmpty(apiKey))
                {
                    Console.WriteLine("[ERROR] API Key no encontrada ni en appsettings.json ni en GROKKEY");
                    throw new Exception("API Key no configurada. Verifica que GROKKEY esté configurada en Railway.");
                }

                Console.WriteLine($"[DEBUG] Enviando {mensajes.Count} mensajes a Groq API");

                // Formato OpenAI-compatible (Groq usa este formato)
                var requestBody = new
                {
                    model = modelo,
                    messages = mensajes,
                    temperature = 0.7,
                    max_tokens = 600, // Aumentado para respuestas completas
                    top_p = 0.9,
                    stop = new[] { "\n\n\n" } // Detener en múltiples saltos de línea vacíos
                };

                var json = JsonSerializer.Serialize(requestBody);
                Console.WriteLine($"[DEBUG] Request body: {json.Substring(0, Math.Min(200, json.Length))}...");
                
                // Crear un nuevo HttpClient limpio
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                
                var httpContent = new StringContent(json, Encoding.UTF8, "application/json");
                
                Console.WriteLine($"[DEBUG] Enviando POST a: {apiUrl}");
                
                var response = await httpClient.PostAsync(apiUrl, httpContent);
                var responseString = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[DEBUG] Status: {response.StatusCode}");
                Console.WriteLine($"[DEBUG] Response: {responseString.Substring(0, Math.Min(500, responseString.Length))}");

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[ERROR] Error en API: Status {response.StatusCode}");
                    Console.WriteLine($"[ERROR] Respuesta completa: {responseString}");
                    throw new Exception($"Error en la API de IA: {response.StatusCode} - {responseString}");
                }

                Console.WriteLine("[DEBUG] Respuesta recibida, parseando...");
                
                // Parsear respuesta formato OpenAI
                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;
                
                string respuesta;
                if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                {
                    var firstChoice = choices[0];
                    if (firstChoice.TryGetProperty("message", out var message))
                    {
                        respuesta = message.GetProperty("content").GetString() ?? string.Empty;
                    }
                    else
                    {
                        respuesta = "No se pudo obtener respuesta del modelo.";
                    }
                }
                else
                {
                    respuesta = "Formato de respuesta inesperado.";
                }

                // Limpiar formato markdown pero mantener guiones para listas
                respuesta = respuesta
                    .Replace("**", "")  // Quitar negritas
                    .Replace("__", "")  // Quitar subrayados dobles
                    .Replace("###", "") // Quitar encabezados nivel 3
                    .Replace("##", "")  // Quitar encabezados nivel 2
                    .Replace("# ", "")  // Quitar encabezados nivel 1
                    .Trim();
                
                // Limpiar asteriscos y guiones bajos que no sean parte de listas
                // Mantener guiones al inicio de línea para listas
                var lineas = respuesta.Split('\n');
                for (int i = 0; i < lineas.Length; i++)
                {
                    var linea = lineas[i];
                    // Si no es una línea de lista (no empieza con guion)
                    if (!linea.TrimStart().StartsWith("-"))
                    {
                        linea = linea.Replace("*", "").Replace("_", "");
                    }
                    lineas[i] = linea;
                }
                respuesta = string.Join('\n', lineas).Trim();

                Console.WriteLine($"[DEBUG] Respuesta parseada exitosamente, longitud: {respuesta.Length}");
                return respuesta.Trim();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Excepción en llamarApiGroq: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}