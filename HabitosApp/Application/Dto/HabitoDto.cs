namespace HabitosApp.Application.DTOs
{
    public class HabitoDto
    {
        public int Id { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string descripcion { get; set; } = string.Empty;
        public string icono { get; set; } = string.Empty;
        public string tipoHabito { get; set; } = string.Empty;
        public int frecuenciaSemanal { get; set; }
        public bool esPersonalizado { get; set; }
        public bool esNegativo { get; set; }
        public bool estaActivo { get; set; }
        public int? categoriaId { get; set; }
        public string? categoriaNombre { get; set; }
        public DateTime fechaCreacion { get; set; }
    }
}