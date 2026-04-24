namespace HabitosApp.Application.DTOs
{
    public class EstadisticasGeneralesDto
    {
        public int totalHabitos { get; set; }
        public int habitosCompletadosHoy { get; set; }
        public double porcentajeHoy { get; set; }
        public int mejorRacha { get; set; }
        public int rachaActualMaxima { get; set; }
        public List<ResumenDiarioDto> ultimos7Dias { get; set; } = new();
    }
}