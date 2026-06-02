using System;
using System.Collections.Generic;

namespace HabitosApp.Domain.Entities
{
    public class TemaForo
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string Contenido { get; set; }
        public string Categoria { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        
        // Relación con el usuario que lo crea (Opcional en la validación de entrada)
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // Relación con los comentarios (Opcional en la validación de entrada)
        public List<RespuestaForo>? Respuestas { get; set; } = new List<RespuestaForo>();
    }
}
