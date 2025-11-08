# Script para obtener el token del administrador

$baseUrl = "http://localhost:3000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "OBTENER TOKEN DE ADMINISTRADOR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Datos de login
$loginData = @{
    cor_usu = "admin@admin.com"
    pas_usu = "admin123"
} | ConvertTo-Json

Write-Host "Haciendo login como admin@admin.com..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    
    Write-Host "✓ Login exitoso`n" -ForegroundColor Green
    
    $token = $response.data.token
    $usuario = $response.data.usuario
    
    Write-Host "INFORMACIÓN DEL USUARIO:" -ForegroundColor Cyan
    Write-Host "  ID: $($usuario.id_usu)" -ForegroundColor White
    Write-Host "  Nombre: $($usuario.nom_usu) $($usuario.ape_usu)" -ForegroundColor White
    Write-Host "  Correo: $($usuario.cor_usu)" -ForegroundColor White
    Write-Host "  Administrador: $($usuario.Administrador)" -ForegroundColor White
    
    Write-Host "`nTOKEN JWT:" -ForegroundColor Cyan
    Write-Host $token -ForegroundColor Yellow
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "CÓMO USAR EL TOKEN EN POSTMAN:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. En Postman, ve a la pestaña 'Headers'" -ForegroundColor White
    Write-Host "2. Agrega un nuevo header:" -ForegroundColor White
    Write-Host "   Key: Authorization" -ForegroundColor White
    Write-Host "   Value: Bearer $($token.Substring(0, 20))..." -ForegroundColor White
    Write-Host "`n3. O en Environment Variables:" -ForegroundColor White
    Write-Host "   Variable: admin_token" -ForegroundColor White
    Write-Host "   Value: $($token.Substring(0, 20))..." -ForegroundColor White
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Guardar token en archivo temporal
    $token | Out-File -FilePath "admin_token.txt" -Encoding UTF8
    Write-Host "✓ Token guardado en: admin_token.txt" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error al hacer login:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Detalle: $($errorDetails.message)" -ForegroundColor Red
    }
    
    Write-Host "`n⚠️  Si la contraseña es incorrecta, ejecuta:" -ForegroundColor Yellow
    Write-Host "   .\reset-admin-password.ps1" -ForegroundColor White
}
