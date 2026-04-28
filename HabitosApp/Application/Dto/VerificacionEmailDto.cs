namespace HabitosApp.Application.DTOs
{
    public class SolicitarVerificacionEmailDto
    {
        public string email { get; set; } = string.Empty;
    }

    public class ConfirmarVerificacionEmailDto
    {
        public string token { get; set; } = string.Empty;
    }

    public class EstadoVerificacionDto
    {
        public bool emailVerificado { get; set; }
        public bool puedeRecibirEmails { get; set; }
        public string mensaje { get; set; } = string.Empty;
    }
}