namespace HabitosApp.Domain.Entities
{
    public class Racha
    {
        public int Id { get; set; }
        public int HabitoId { get; set; }
        public int DiasActual { get; set; } = 0;
        public int DiasRecord { get; set; } = 0;
        public DateOnly FechaInicioActual { get; set; }
        public DateOnly FechaUltimoRegistro { get; set; }

        // Navegación
        public Habito Habito { get; set; } = null!;
    }
}