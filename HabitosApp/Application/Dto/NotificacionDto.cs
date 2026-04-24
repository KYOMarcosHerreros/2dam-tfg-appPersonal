namespace HabitosApp.Application.DTOs
{
    public class NotificacionDto
    {
        public int id { get; set; }
        public string tipo { get; set; } = string.Empty;
        public string mensaje { get; set; } = string.Empty;
        public bool leida { get; set; }
        public DateTime fechaCreacion { get; set; }
    }
}