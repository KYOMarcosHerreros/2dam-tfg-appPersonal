using HabitosApp.Domain.Enums;

namespace HabitosApp.Domain.Entities
{
    public class Habito
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public int? CategoriaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Icono { get; set; } = string.Empty;
        public TipoHabito TipoHabito { get; set; }
        public int FrecuenciaSemanal { get; set; } = 7;
        public bool EsPersonalizado { get; set; } = false;
        public bool EsNegativo { get; set; } = false;
        public bool EstaActivo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Navegación
        public Usuario Usuario { get; set; } = null!;
        public Categoria? Categoria { get; set; }
        public ICollection<RegistroDiario> RegistrosDiarios { get; set; } = new List<RegistroDiario>();
        public Racha? Racha { get; set; }
    }
}