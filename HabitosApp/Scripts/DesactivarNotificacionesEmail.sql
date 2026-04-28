-- Script para desactivar notificaciones por email por defecto
-- Ejecutar después de actualizar la entidad Usuario

-- Actualizar usuarios existentes para que tengan notificaciones por email desactivadas
UPDATE Usuarios 
SET NotificacionesEmail = 0 
WHERE NotificacionesEmail = 1;

-- Verificar el cambio
SELECT Id, Nombre, Email, NotificacionesEmail, NotificacionesPush 
FROM Usuarios;