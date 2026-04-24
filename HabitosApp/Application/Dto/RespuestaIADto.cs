namespace HabitosApp.Application.DTOs
{
    public class RespuestaIADto
    {
        public string respuesta { get; set; } = string.Empty;
        public List<MensajeIADto> historial { get; set; } = new();
    }
}