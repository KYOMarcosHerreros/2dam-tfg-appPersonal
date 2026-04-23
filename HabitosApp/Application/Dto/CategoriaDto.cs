namespace HabitosApp.Application.DTOs
{
    public class CategoriaDto
    {
        public int Id { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string descripcion { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public string color { get; set; } = string.Empty;
    }
}