namespace HabitosApp.Application.DTOs
{
    public class PerfilDto
    {
        public int id { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? telefono { get; set; }
        public string? fotoPerfil { get; set; }
        public bool notificacionesEmail { get; set; }
        public bool notificacionesPush { get; set; }
        public bool emailVerificado { get; set; } // Nuevo campo
        public DateTime fechaRegistro { get; set; }
    }

    public class ActualizarPerfilDto
    {
        public string nombre { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? telefono { get; set; }
        public string? fotoPerfil { get; set; }
        public bool notificacionesEmail { get; set; }
        public bool notificacionesPush { get; set; }
    }
}
