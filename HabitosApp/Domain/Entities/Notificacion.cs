namespace HabitosApp.Domain.Entities
{
    public class Notificacion
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Tipo { get; set; } = string.Empty; // "email" o "push"
        public string Mensaje { get; set; } = string.Empty;
        public bool Leida { get; set; } = false;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaEnvio { get; set; }

        // Navegación
        public Usuario Usuario { get; set; } = null!;
    }
}