namespace HabitosApp.Domain.Entities
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Icono { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;

        // Navegación
        public ICollection<Habito> Habitos { get; set; } = new List<Habito>();
    }
}