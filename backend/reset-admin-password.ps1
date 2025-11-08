# Script para resetear la contraseña del administrador
# Nueva contraseña: admin123

# El hash bcrypt de "admin123" con 10 rounds
$hashAdmin123 = '$2b$10$nT2IJUIE27NRBXynZJ3FhuwoGFzA4T3uOu8AFF2CSvqe8IGu61W8C'

Write-Host "Actualizando contraseña del administrador a 'admin123'..." -ForegroundColor Yellow

$env:PGPASSWORD="postgres"
psql -U postgres -d Gestion-Eventos -c "UPDATE usuarios SET pas_usu = '$hashAdmin123' WHERE cor_usu = 'admin@admin.com';"

Write-Host "✓ Contraseña actualizada exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes hacer login con:" -ForegroundColor Cyan
Write-Host "  Correo: admin@admin.com" -ForegroundColor White
Write-Host "  Contraseña: admin123" -ForegroundColor White
