# 📧 Configuración de Notificaciones por Email

## 🚀 Configuración Rápida

### 1. Crear cuenta de Gmail para la aplicación
1. Crea una nueva cuenta de Gmail: `habitosapp.notifications@gmail.com`
2. Activa la verificación en 2 pasos
3. Genera una "Contraseña de aplicación":
   - Ve a Configuración de Google → Seguridad
   - Verificación en 2 pasos → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Windows Computer"
   - Copia la contraseña generada (16 caracteres)

### 2. Configurar variables de entorno
Actualiza el archivo `.env` con los datos reales:

```env
EMAIL_SERVIDOR=smtp.gmail.com
EMAIL_PUERTO=587
EMAIL_USUARIO=habitosapp.notifications@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion_aqui
EMAIL_NOMBRE_REMITENTE=HabitosApp - Tu Asistente de Hábitos
```

### 3. Probar el sistema
1. Inicia la aplicación
2. Ve a Swagger: `http://localhost:5000/swagger`
3. Autentícate con tu usuario
4. Ejecuta el endpoint: `POST /api/notificaciones/probar-email`
5. Revisa tu bandeja de entrada

## 📋 Tipos de notificaciones que se envían

### 🌅 **Consejos Diarios**
- **Cuándo**: Cada 24 horas
- **Contenido**: Consejos personalizados generados por IA
- **Condición**: Solo si el usuario tiene `NotificacionesEmail = true`

### ⚠️ **Recordatorios de Inactividad**
- **Cuándo**: Después de 3 días sin actividad
- **Contenido**: Motivación para volver a usar la app
- **Frecuencia**: Máximo 1 por día

### 🎯 **Notificaciones Manuales**
- **Cuándo**: Cuando se llama al endpoint de prueba
- **Contenido**: Mensajes personalizados
- **Uso**: Testing y notificaciones especiales

## 🎨 Características del Email

### ✨ **Diseño Atractivo**
- Template HTML responsive
- Colores de la marca (gradiente púrpura-rosa)
- Iconos y emojis
- Botón de call-to-action

### 📱 **Compatibilidad**
- Funciona en todos los clientes de email
- Fallback a texto plano
- Responsive design para móviles

### 🔒 **Seguridad**
- Autenticación SMTP segura
- Variables de entorno para credenciales
- Manejo de errores robusto

## 🛠️ Troubleshooting

### ❌ Error: "Authentication failed"
- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de que la verificación en 2 pasos esté activada
- Revisa que el usuario de Gmail sea correcto

### ❌ Error: "Connection timeout"
- Verifica la conexión a internet
- Confirma que el puerto 587 no esté bloqueado
- Prueba con otro servidor SMTP si es necesario

### ❌ Los emails no llegan
- Revisa la carpeta de spam
- Verifica que el email del usuario sea válido
- Comprueba los logs del servidor para errores

## 📊 Monitoreo

Los logs del sistema mostrarán:
- ✅ Emails enviados exitosamente
- ❌ Errores de envío con detalles
- 📈 Estadísticas de notificaciones por usuario

## 🔄 Próximas mejoras

- [ ] Templates de email personalizables
- [ ] Programación de horarios de envío
- [ ] Métricas de apertura de emails
- [ ] Integración con otros proveedores (SendGrid, Mailgun)
- [ ] Notificaciones push para móviles