namespace HabitosApp.Application.DTOs
{
    public class ActualizarHabitoDto
    {
        public string nombre { get; set; } = string.Empty;
        public string descripcion { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public int frecuenciaSemanal { get; set; }
        public bool esNegativo { get; set; }
    }
}