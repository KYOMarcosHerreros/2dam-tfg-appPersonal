namespace HabitosApp.Domain.Entities
{
    public class MensajeIA
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Rol { get; set; } = string.Empty; // "user" o "assistant"
        public string Contenido { get; set; } = string.Empty;
        public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;

        // Navegación
        public Usuario Usuario { get; set; } = null!;
    }
}