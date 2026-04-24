namespace HabitosApp.Application.DTOs
{
    public class RegistroDiarioDto
    {
        public int Id { get; set; }
        public int habitoId { get; set; }
        public string habitoNombre { get; set; } = string.Empty;
        public DateOnly fecha { get; set; }
        public bool completado { get; set; }
        public string? nota { get; set; }
    }
}