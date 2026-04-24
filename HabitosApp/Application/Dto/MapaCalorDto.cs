namespace HabitosApp.Application.DTOs
{
    public class MapaCalorDto
    {
        public DateOnly fecha { get; set; }
        public int habitosCompletados { get; set; }
        public int totalHabitos { get; set; }
        public double porcentaje { get; set; }
    }
}