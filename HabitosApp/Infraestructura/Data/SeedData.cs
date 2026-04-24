using HabitosApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HabitosApp.Infrastructure.Data
{
    public static class SeedData
    {
        public static async Task inicializarAsync(AppDbContext contexto)
        {
            if (await contexto.Categorias.AnyAsync()) return;

            var categorias = new List<Categoria>
            {
                new Categoria { Nombre = "Salud física", Descripcion = "Hábitos relacionados con tu salud y bienestar físico", Icono = "🏥", Color = "#FF6B6B" },
                new Categoria { Nombre = "Deporte", Descripcion = "Actividad física y ejercicio", Icono = "💪", Color = "#FF8E53" },
                new Categoria { Nombre = "Nutrición", Descripcion = "Alimentación y dieta saludable", Icono = "🥗", Color = "#4CAF50" },
                new Categoria { Nombre = "Bienestar mental", Descripcion = "Salud mental, meditación y mindfulness", Icono = "🧘", Color = "#9C27B0" },
                new Categoria { Nombre = "Productividad", Descripcion = "Hábitos para mejorar tu rendimiento y organización", Icono = "⚡", Color = "#FF9800" },
                new Categoria { Nombre = "Cultura", Descripcion = "Lectura, aprendizaje y desarrollo personal", Icono = "📚", Color = "#2196F3" },
                new Categoria { Nombre = "Economía", Descripcion = "Finanzas personales y hábitos de ahorro", Icono = "💰", Color = "#4CAF50" },
                new Categoria { Nombre = "Relaciones sociales", Descripcion = "Familia, amigos y vida social", Icono = "👥", Color = "#E91E63" },
                new Categoria { Nombre = "Tecnología", Descripcion = "Programación, informática y habilidades digitales", Icono = "💻", Color = "#607D8B" },
                new Categoria { Nombre = "Otro", Descripcion = "Otros hábitos personales", Icono = "⭐", Color = "#9E9E9E" }
            };

            contexto.Categorias.AddRange(categorias);
            await contexto.SaveChangesAsync();
        }
    }
}