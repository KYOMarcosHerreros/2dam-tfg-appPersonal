using HabitosApp.Domain.Entities;

namespace HabitosApp.Domain.Entities
{
	public class RegistroDiario
	{
		public int Id { get; set; }
		public int HabitoId { get; set; }
		public int UsuarioId { get; set; }
		public DateOnly Fecha { get; set; }
		public bool Completado { get; set; }
		public string? Nota { get; set; }
		public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

		// Navegación
		public Habito Habito { get; set; } = null!;
		public Usuario Usuario { get; set; } = null!;
	}
}