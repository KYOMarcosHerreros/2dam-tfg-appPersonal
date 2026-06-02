using System;

namespace HabitosApp.Domain.Entities
{
    public class RespuestaForo
    {
        public int Id { get; set; }
        public string Contenido { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public int TemaForoId { get; set; }
        public TemaForo TemaForo { get; set; }

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; }
    }
}