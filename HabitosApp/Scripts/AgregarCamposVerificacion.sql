-- Script para agregar campos de verificación de email
-- Ejecutar en la base de datos antes de probar el sistema

-- Agregar nuevos campos a la tabla Usuarios
ALTER TABLE Usuarios 
ADD EmailVerificado BIT NOT NULL DEFAULT 0,
    TokenVerificacionEmail NVARCHAR(255) NULL,
    FechaTokenVerificacion DATETIME2 NULL;

-- Actualizar usuarios existentes para que tengan notificaciones desactivadas
UPDATE Usuarios 
SET NotificacionesEmail = 0, 
    EmailVerificado = 0
WHERE EmailVerificado IS NULL OR NotificacionesEmail = 1;

-- Verificar los cambios
SELECT Id, Nombre, Email, NotificacionesEmail, EmailVerificado, TokenVerificacionEmail, FechaTokenVerificacion
FROM Usuarios;