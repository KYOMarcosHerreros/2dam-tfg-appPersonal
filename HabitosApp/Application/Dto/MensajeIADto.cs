namespace HabitosApp.Application.DTOs
{
    public class MensajeIADto
    {
        public string rol { get; set; } = string.Empty;
        public string contenido { get; set; } = string.Empty;
        public DateTime fechaEnvio { get; set; }
    }
}