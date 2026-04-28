namespace HabitosApp.Application.DTOs
{
    public class SugerenciaCategorizacionDto
    {
        public int CategoriaIdSugerida { get; set; }
        public string CategoriaNombre { get; set; } = string.Empty;
        public string Razon { get; set; } = string.Empty;
        public double Confianza { get; set; } // Porcentaje de confianza de la IA
        public List<CategoriaAlternativaDto> AlternativasSugeridas { get; set; } = new();
    }

    public class CategoriaAlternativaDto
    {
        public int CategoriaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public double Confianza { get; set; }
    }
}