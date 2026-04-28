# Script de diagnóstico para verificar configuración de IA

Write-Host "=== DIAGNÓSTICO DE CONFIGURACIÓN IA ===" -ForegroundColor Cyan
Write-Host ""

# Leer appsettings.json
$config = Get-Content "appsettings.json" | ConvertFrom-Json

Write-Host "Provider: $($config.AI.provider)" -ForegroundColor Green
Write-Host "Modelo: $($config.AI.modelo)" -ForegroundColor Green
Write-Host "API URL: $($config.AI.apiUrl)" -ForegroundColor Green

if ($config.AI.apiKey -and $config.AI.apiKey -ne "TU_API_KEY_DE_HUGGINGFACE" -and $config.AI.apiKey -ne "PEGA_AQUI_TU_TOKEN_DE_HUGGINGFACE") {
    $keyPreview = $config.AI.apiKey.Substring(0, [Math]::Min(15, $config.AI.apiKey.Length))
    Write-Host "API Key: $keyPreview..." -ForegroundColor Green
    Write-Host "✓ API Key configurada correctamente" -ForegroundColor Green
} else {
    Write-Host "✗ API Key NO configurada - Falta poner tu token de Hugging Face" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PRUEBA DE CONEXIÓN ===" -ForegroundColor Cyan
Write-Host "Probando conexión a Hugging Face..." -ForegroundColor Yellow

$url = "$($config.AI.apiUrl)$($config.AI.modelo)"
Write-Host "URL: $url"

$headers = @{
    "Authorization" = "Bearer $($config.AI.apiKey)"
    "Content-Type" = "application/json"
}

$body = @{
    inputs = "Hola"
    parameters = @{
        max_new_tokens = 50
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $body -TimeoutSec 30
    Write-Host "✓ Conexión exitosa! Status: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error en la conexión" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
}
