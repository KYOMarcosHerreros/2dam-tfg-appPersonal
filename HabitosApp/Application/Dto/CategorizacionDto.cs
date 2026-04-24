namespace HabitosApp.Application.DTOs
{
    public class CategorizacionDto
    {
        public string categoria { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public List<string> recomendaciones { get; set; } = new();
    }
}