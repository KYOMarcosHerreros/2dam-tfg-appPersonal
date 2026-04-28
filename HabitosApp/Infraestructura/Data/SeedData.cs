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
                new Categoria { Nombre = "Salud Física", Descripcion = "Hábitos relacionados con la salud y bienestar físico", Icono = "Activity", Color = "#FF6B6B" },
                new Categoria { Nombre = "Ejercicio y Deporte", Descripcion = "Actividades físicas, deportes y fitness", Icono = "Dumbbell", Color = "#4ECDC4" },
                new Categoria { Nombre = "Salud Mental", Descripcion = "Bienestar emocional, meditación y mindfulness", Icono = "Heart", Color = "#96CEB4" },
                new Categoria { Nombre = "Productividad", Descripcion = "Organización, gestión del tiempo y eficiencia", Icono = "CheckSquare", Color = "#45B7D1" },
                new Categoria { Nombre = "Aprendizaje", Descripcion = "Educación, lectura y desarrollo de habilidades", Icono = "BookOpen", Color = "#FFEAA7" },
                new Categoria { Nombre = "Tecnología", Descripcion = "Programación, informática y habilidades digitales", Icono = "Laptop", Color = "#A29BFE" },
                new Categoria { Nombre = "Finanzas", Descripcion = "Gestión financiera, ahorro e inversiones", Icono = "Wallet", Color = "#00B894" },
                new Categoria { Nombre = "Relaciones Sociales", Descripcion = "Comunicación, networking y relaciones interpersonales", Icono = "Users", Color = "#FD79A8" },
                new Categoria { Nombre = "Creatividad", Descripcion = "Arte, música, escritura y expresión creativa", Icono = "Palette", Color = "#FDCB6E" },
                new Categoria { Nombre = "Hogar y Organización", Descripcion = "Limpieza, organización y cuidado del hogar", Icono = "Home", Color = "#6C5CE7" },
                new Categoria { Nombre = "Alimentación", Descripcion = "Nutrición, cocina y hábitos alimentarios", Icono = "Apple", Color = "#00CEC9" },
                new Categoria { Nombre = "Personalizado", Descripcion = "Hábitos únicos creados por el usuario", Icono = "Star", Color = "#74B9FF" }
            };

            contexto.Categorias.AddRange(categorias);
            await contexto.SaveChangesAsync();
        }
    }
}