namespace HabitosApp.Application.DTOs
{
    public class CrearHabitoPersonalizadoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Icono { get; set; } = string.Empty;
        public int TipoHabito { get; set; }
        public int FrecuenciaSemanal { get; set; } = 7;
        public bool EsNegativo { get; set; } = false;
        public int? CategoriaIdSugerida { get; set; } // Categoría sugerida por el usuario
        public bool UsarCategorizacionIA { get; set; } = true; // Si quiere que la IA ayude a categorizar
    }
}