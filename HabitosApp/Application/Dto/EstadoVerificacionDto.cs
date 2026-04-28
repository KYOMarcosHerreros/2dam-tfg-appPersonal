namespace HabitosApp.Application.DTOs
{
    public class EstadoVerificacionDto
    {
        public bool emailVerificado { get; set; }
        public bool puedeRecibirEmails { get; set; }
        public string mensaje { get; set; } = string.Empty;
    }
}