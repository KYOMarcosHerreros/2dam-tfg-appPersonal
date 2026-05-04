using HabitosApp.Application.Interfaces;
using HabitosApp.Application.Services;
using HabitosApp.Infrastructure.Data;
using HabitosApp.Infrastructure.Jobs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuración para Railway - Puerto dinámico
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Base de datos
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

if (string.IsNullOrEmpty(connectionString))
{
    // Fallback para desarrollo local
    connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=HabitosAppDB;Trusted_Connection=True;TrustServerCertificate=True";
    Console.WriteLine("Using local SQL Server database");
    
    builder.Services.AddDbContext<AppDbContext>(opciones =>
        opciones.UseSqlServer(connectionString));
}
else
{
    Console.WriteLine($"Using PostgreSQL database: {connectionString.Substring(0, Math.Min(50, connectionString.Length))}...");
    
    builder.Services.AddDbContext<AppDbContext>(opciones =>
        opciones.UseNpgsql(connectionString));
}

// JWT
var claveJwt = Environment.GetEnvironmentVariable("JWT_SECRET") ?? 
               "HabitosApp_SuperSecretKey_2024_MinLength32Chars_ForProduction";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "HabitosApp",
            ValidAudience = "HabitosAppUsuarios",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJwt))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IRegistroDiarioService, RegistroDiarioService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHabitoService, HabitoService>();
builder.Services.AddScoped<IEstadisticasService, EstadisticasService>();
builder.Services.AddHttpClient("Groq");
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<INotificacionService, NotificacionService>();
builder.Services.AddScoped<IVerificacionEmailService, VerificacionEmailService>();
builder.Services.AddHostedService<InactividadJob>();
builder.Services.AddHostedService<ConsejoDiarioJob>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opciones =>
{
    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Introduce el token JWT"
    });

    opciones.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// CORS para el frontend React (desarrollo y producción)
builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy("politicaFrontend", politica =>
    {
        var origenes = new List<string> { "http://localhost:5173" };
        
        // Añadir URL de producción si existe
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        if (!string.IsNullOrEmpty(frontendUrl) && frontendUrl != "http://localhost:5173")
        {
            origenes.Add(frontendUrl);
        }
        
        politica.WithOrigins(origenes.ToArray())
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("politicaFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var contexto = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    try
    {
        await contexto.Database.EnsureCreatedAsync();
        await SeedData.inicializarAsync(contexto);
        Console.WriteLine("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization failed: {ex.Message}");
        // Continue without seeding data
    }
}

app.Run();