namespace HabitosApp.Application.DTOs
{
    public class CrearHabitoDto
    {
        public string nombre { get; set; } = string.Empty;
        public string descripcion { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public int frecuenciaSemanal { get; set; } = 7;
        public bool esNegativo { get; set; } = false;
        public int? categoriaId { get; set; }
    }
}