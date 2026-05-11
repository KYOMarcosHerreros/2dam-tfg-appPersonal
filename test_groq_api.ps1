# Script para probar la API key de Groq

$apiKey = "0ILCOgSu4NnhZGGtQ8r2n27W5rM/agJZqU4cOT0H7BLoh6cMOk1KbUhr"
$url = "https://api.groq.com/openai/v1/chat/completions"

Write-Host "🧪 Probando API key de Groq..." -ForegroundColor Cyan
Write-Host "API Key: $($apiKey.Substring(0, 10))..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    model = "llama-3.1-70b-versatile"
    messages = @(
        @{
            role = "user"
            content = "Hola, responde solo con 'OK'"
        }
    )
    max_tokens = 10
} | ConvertTo-Json -Depth 3

try {
    Write-Host "📡 Enviando petición a Groq..." -ForegroundColor White
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -TimeoutSec 30
    
    Write-Host "✅ API Key VÁLIDA - Respuesta recibida:" -ForegroundColor Green
    Write-Host $response.choices[0].message.content -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    
    Write-Host "❌ API Key INVÁLIDA" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
    
    if ($errorBody -like "*invalid_api_key*") {
        Write-Host ""
        Write-Host "🔧 SOLUCIÓN:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://console.groq.com" -ForegroundColor White
        Write-Host "2. Genera una nueva API key" -ForegroundColor White
        Write-Host "3. Actualiza GROKKEY en Railway" -ForegroundColor White
    }
}