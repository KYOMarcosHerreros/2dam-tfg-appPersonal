namespace HabitosApp.Application.DTOs
{
    public class EstadisticaHabitoDto
    {
        public int habitoId { get; set; }
        public string habitoNombre { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public int totalDias { get; set; }
        public int diasCompletados { get; set; }
        public double porcentajeExito { get; set; }
        public int rachaActual { get; set; }
        public int rachaRecord { get; set; }
    }
}