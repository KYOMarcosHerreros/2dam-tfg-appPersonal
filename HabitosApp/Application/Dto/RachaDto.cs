namespace HabitosApp.Application.DTOs
{
    public class RachaDto
    {
        public int habitoId { get; set; }
        public string habitoNombre { get; set; } = string.Empty;
        public int diasActual { get; set; }
        public int diasRecord { get; set; }
        public DateOnly fechaInicioActual { get; set; }
        public DateOnly fechaUltimoRegistro { get; set; }
    }
}