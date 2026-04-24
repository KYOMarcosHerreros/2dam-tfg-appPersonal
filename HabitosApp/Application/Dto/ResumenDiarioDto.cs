namespace HabitosApp.Application.DTOs
{
    public class ResumenDiarioDto
    {
        public DateOnly fecha { get; set; }
        public int totalHabitos { get; set; }
        public int habitosCompletados { get; set; }
        public double porcentajeCompletado { get; set; }
        public List<RegistroDiarioDto> registros { get; set; } = new();
    }
}