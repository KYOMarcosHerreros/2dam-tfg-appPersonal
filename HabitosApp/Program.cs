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

Console.WriteLine($"DATABASE_URL environment variable: {(string.IsNullOrEmpty(connectionString) ? "NOT SET" : "SET")}");

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
    
    try
    {
        // Convertir URL de PostgreSQL al formato de Npgsql
        var uri = new Uri(connectionString);
        var npgsqlConnectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.Trim('/')};Username={uri.UserInfo.Split(':')[0]};Password={uri.UserInfo.Split(':')[1]};SSL Mode=Require;Trust Server Certificate=true";
        
        Console.WriteLine($"Converted connection string: Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.Trim('/')};Username={uri.UserInfo.Split(':')[0]};Password=***");
        
        builder.Services.AddDbContext<AppDbContext>(opciones =>
            opciones.UseNpgsql(npgsqlConnectionString));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error parsing connection string: {ex.Message}");
        Console.WriteLine("Falling back to local SQL Server");
        
        // Fallback a SQL Server local si PostgreSQL falla
        var fallbackConnection = "Server=(localdb)\\MSSQLLocalDB;Database=HabitosAppDB;Trusted_Connection=True;TrustServerCertificate=True";
        builder.Services.AddDbContext<AppDbContext>(opciones =>
            opciones.UseSqlServer(fallbackConnection));
    }
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
        var origenes = new List<string> { 
            "http://localhost:5173",
            "https://front-production-cf2b.up.railway.app"
        };
        
        // Añadir URL de producción si existe
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        if (!string.IsNullOrEmpty(frontendUrl) && !origenes.Contains(frontendUrl))
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

// Debug: Mostrar todas las variables de entorno
Console.WriteLine("=== ENVIRONMENT VARIABLES DEBUG ===");
Console.WriteLine($"DATABASE_URL: {Environment.GetEnvironmentVariable("DATABASE_URL") ?? "NULL"}");
Console.WriteLine($"JWT_SECRET: {(string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_SECRET")) ? "NULL" : "SET")}");
Console.WriteLine($"GROKKEY: {(string.IsNullOrEmpty(Environment.GetEnvironmentVariable("GROKKEY")) ? "NULL" : "SET")}");
Console.WriteLine("=====================================");

// Habilitar Swagger en producción para Railway
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HabitosApp API V1");
    c.RoutePrefix = "swagger";
});

if (app.Environment.IsDevelopment())
{
    // Configuraciones adicionales para desarrollo si las hay
}

//app.UseHttpsRedirection();
app.UseCors("politicaFrontend");

// Middleware de logging simplificado
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/VerificacionEmail"))
    {
        Console.WriteLine($"🌐 REQUEST: {context.Request.Method} {context.Request.Path}");
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// Ruta de prueba para verificar que la API funciona
app.MapGet("/", () => "HabitosApp API está funcionando! Ve a /swagger para la documentación.");
app.MapGet("/health", () => new { status = "OK", timestamp = DateTime.UtcNow, version = "1.0.3", email = "sendgrid-http-api" });

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var contexto = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    try
    {
        Console.WriteLine("Attempting to connect to database...");
        await contexto.Database.CanConnectAsync();
        Console.WriteLine("Database connection successful!");
        
        Console.WriteLine("Creating database if not exists...");
        await contexto.Database.EnsureCreatedAsync();
        Console.WriteLine("Database created successfully!");
        
        Console.WriteLine("Initializing seed data...");
        await SeedData.inicializarAsync(contexto);
        Console.WriteLine("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Continue without seeding data
    }
}

app.Run();