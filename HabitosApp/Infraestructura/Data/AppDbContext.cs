using HabitosApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HabitosApp.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opciones) : base(opciones) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Habito> Habitos { get; set; }
        public DbSet<RegistroDiario> RegistrosDiarios { get; set; }
        public DbSet<Racha> Rachas { get; set; }
        public DbSet<MensajeIA> MensajesIA { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Usuario
            modelBuilder.Entity<Usuario>(entidad =>
            {
                entidad.HasIndex(u => u.Email).IsUnique();
                entidad.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
                entidad.Property(u => u.Email).IsRequired().HasMaxLength(200);
                entidad.Property(u => u.PasswordHash).IsRequired();
            });

            // Categoria
            modelBuilder.Entity<Categoria>(entidad =>
            {
                entidad.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
                entidad.Property(c => c.Color).HasMaxLength(7); // formato #FFFFFF
            });

            // Habito
            modelBuilder.Entity<Habito>(entidad =>
            {
                entidad.Property(h => h.Nombre).IsRequired().HasMaxLength(150);
                entidad.Property(h => h.TipoHabito).HasConversion<string>();

                entidad.HasOne(h => h.Usuario)
                    .WithMany(u => u.Habitos)
                    .HasForeignKey(h => h.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);

                entidad.HasOne(h => h.Categoria)
                    .WithMany(c => c.Habitos)
                    .HasForeignKey(h => h.CategoriaId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // RegistroDiario
            modelBuilder.Entity<RegistroDiario>(entidad =>
            {
                entidad.HasIndex(r => new { r.HabitoId, r.Fecha }).IsUnique();

                entidad.HasOne(r => r.Habito)
                    .WithMany(h => h.RegistrosDiarios)
                    .HasForeignKey(r => r.HabitoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entidad.HasOne(r => r.Usuario)
                    .WithMany(u => u.RegistrosDiarios)
                    .HasForeignKey(r => r.UsuarioId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Racha
            modelBuilder.Entity<Racha>(entidad =>
            {
                entidad.HasOne(r => r.Habito)
                    .WithOne(h => h.Racha)
                    .HasForeignKey<Racha>(r => r.HabitoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MensajeIA
            modelBuilder.Entity<MensajeIA>(entidad =>
            {
                entidad.Property(m => m.Rol).IsRequired().HasMaxLength(20);
                entidad.Property(m => m.Contenido).IsRequired();

                entidad.HasOne(m => m.Usuario)
                    .WithMany(u => u.MensajesIA)
                    .HasForeignKey(m => m.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Notificacion
            modelBuilder.Entity<Notificacion>(entidad =>
            {
                entidad.Property(n => n.Tipo).IsRequired().HasMaxLength(20);
                entidad.Property(n => n.Mensaje).IsRequired();

                entidad.HasOne(n => n.Usuario)
                    .WithMany(u => u.Notificaciones)
                    .HasForeignKey(n => n.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}