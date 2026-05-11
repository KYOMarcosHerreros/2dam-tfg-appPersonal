# Script para probar las credenciales de Gmail SMTP

$servidor = "smtp.gmail.com"
$puerto = 587
$usuario = "marcosTfgCartero@gmail.com"
$password = "iytkzsvhezzaevxu"

Write-Host "🧪 Probando credenciales de Gmail SMTP..." -ForegroundColor Cyan
Write-Host "Servidor: $servidor" -ForegroundColor Yellow
Write-Host "Puerto: $puerto" -ForegroundColor Yellow
Write-Host "Usuario: $usuario" -ForegroundColor Yellow
Write-Host ""

try {
    # Crear cliente SMTP
    Add-Type -AssemblyName System.Net.Mail
    $smtp = New-Object System.Net.Mail.SmtpClient($servidor, $puerto)
    $smtp.EnableSsl = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential($usuario, $password)
    
    # Crear mensaje de prueba
    $mensaje = New-Object System.Net.Mail.MailMessage
    $mensaje.From = $usuario
    $mensaje.To.Add("test@example.com")  # Email de prueba
    $mensaje.Subject = "Test SMTP"
    $mensaje.Body = "Test"
    
    Write-Host "📡 Intentando conectar y autenticar..." -ForegroundColor White
    
    # Intentar enviar (fallará por el email de destino, pero nos dirá si la auth funciona)
    $smtp.Send($mensaje)
    
    Write-Host "✅ Credenciales VÁLIDAS" -ForegroundColor Green
    
} catch {
    $errorMessage = $_.Exception.Message
    
    if ($errorMessage -like "*authentication*" -or $errorMessage -like "*username*" -or $errorMessage -like "*password*") {
        Write-Host "❌ CREDENCIALES INVÁLIDAS" -ForegroundColor Red
        Write-Host "La contraseña de aplicación no es correcta" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 SOLUCIÓN:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://myaccount.google.com/security" -ForegroundColor White
        Write-Host "2. Activa la verificación en 2 pasos" -ForegroundColor White
        Write-Host "3. Genera una nueva contraseña de aplicación" -ForegroundColor White
        Write-Host "4. Actualiza EMAIL_PASSWORD en Railway" -ForegroundColor White
    } elseif ($errorMessage -like "*recipient*" -or $errorMessage -like "*mailbox*") {
        Write-Host "✅ Credenciales VÁLIDAS (error esperado por email de destino)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error desconocido:" -ForegroundColor Red
        Write-Host $errorMessage -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Verificaciones adicionales:" -ForegroundColor Cyan
Write-Host "- ¿Está activada la verificación en 2 pasos en Gmail?" -ForegroundColor White
Write-Host "- ¿La contraseña es una 'contraseña de aplicación' y no la contraseña normal?" -ForegroundColor White
Write-Host "- ¿La cuenta de Gmail permite aplicaciones menos seguras?" -ForegroundColor White