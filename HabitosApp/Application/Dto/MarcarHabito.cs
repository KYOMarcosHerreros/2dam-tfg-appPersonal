namespace HabitosApp.Application.DTOs
{
    public class MarcarHabitoDto
    {
        public int habitoId { get; set; }
        public DateOnly fecha { get; set; }
        public bool completado { get; set; }
        public string? nota { get; set; }
    }
}