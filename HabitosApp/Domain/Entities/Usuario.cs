namespace HabitosApp.Domain.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? FotoPerfil { get; set; }
        public bool NotificacionesEmail { get; set; } = false; // Por defecto desactivado
        public bool NotificacionesPush { get; set; } = true;
        public bool EmailVerificado { get; set; } = false; // Nuevo campo
        public string? TokenVerificacionEmail { get; set; } // Nuevo campo
        public DateTime? FechaTokenVerificacion { get; set; } // Nuevo campo
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
        public DateTime? UltimoAcceso { get; set; }

        // Navegación
        public ICollection<Habito> Habitos { get; set; } = new List<Habito>();
        public ICollection<RegistroDiario> RegistrosDiarios { get; set; } = new List<RegistroDiario>();
        public ICollection<MensajeIA> MensajesIA { get; set; } = new List<MensajeIA>();
        public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();
    }
}