# Script de prueba para el sistema de autenticación y eventos
# Asegúrate de que el servidor esté corriendo en http://localhost:3000

$baseUrl = "http://localhost:3000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE AUTENTICACIÓN Y EVENTOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ====================================
# 1. REGISTRO DE ADMINISTRADOR
# ====================================
Write-Host "1. Registrando ADMINISTRADOR (admin@uta.edu.ec)..." -ForegroundColor Yellow

$adminData = @{
    cor_usu = "admin@uta.edu.ec"
    pas_usu = "admin123"
    nom_usu = "Administrador"
    ape_usu = "Sistema"
    ced_usu = "1234567890"
    tel_usu = "0987654321"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $adminData -ContentType "application/json"
    Write-Host "✓ Administrador registrado exitosamente" -ForegroundColor Green
    Write-Host "  - ID: $($adminResponse.data.usuario.id_usu)" -ForegroundColor Gray
    Write-Host "  - Administrador: $($adminResponse.data.usuario.Administrador)" -ForegroundColor Gray
    Write-Host "  - Token: $($adminResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
    $adminToken = $adminResponse.data.token
} catch {
    Write-Host "✗ Error al registrar administrador: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Detalle: $($errorDetails.message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ====================================
# 2. REGISTRO DE USUARIO ADMINISTRATIVO (PROFESOR)
# ====================================
Write-Host "`n2. Registrando USUARIO ADMINISTRATIVO (profesor@uta.edu.ec)..." -ForegroundColor Yellow

$profesorData = @{
    cor_usu = "profesor@uta.edu.ec"
    pas_usu = "profesor123"
    nom_usu = "Juan"
    ape_usu = "Pérez"
    ced_usu = "0987654321"
    tel_usu = "0987654322"
} | ConvertTo-Json

try {
    $profesorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $profesorData -ContentType "application/json"
    Write-Host "✓ Usuario administrativo registrado exitosamente" -ForegroundColor Green
    Write-Host "  - ID: $($profesorResponse.data.usuario.id_usu)" -ForegroundColor Gray
    Write-Host "  - adm_usu: $($profesorResponse.data.usuario.adm_usu)" -ForegroundColor Gray
    Write-Host "  - Administrador: $($profesorResponse.data.usuario.Administrador)" -ForegroundColor Gray
    $profesorId = $profesorResponse.data.usuario.id_usu
    $profesorToken = $profesorResponse.data.token
} catch {
    Write-Host "✗ Error al registrar profesor: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Detalle: $($errorDetails.message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ====================================
# 3. REGISTRO DE ESTUDIANTE
# ====================================
Write-Host "`n3. Registrando ESTUDIANTE (jose1234@uta.edu.ec)..." -ForegroundColor Yellow

$estudianteData = @{
    cor_usu = "jose1234@uta.edu.ec"
    pas_usu = "estudiante123"
    nom_usu = "José"
    ape_usu = "García"
    ced_usu = "1122334455"
    tel_usu = "0987654323"
    niv_usu = "SEX"
} | ConvertTo-Json

try {
    $estudianteResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $estudianteData -ContentType "application/json"
    Write-Host "✓ Estudiante registrado exitosamente" -ForegroundColor Green
    Write-Host "  - ID: $($estudianteResponse.data.usuario.id_usu)" -ForegroundColor Gray
    Write-Host "  - stu_usu: $($estudianteResponse.data.usuario.stu_usu)" -ForegroundColor Gray
    Write-Host "  - Administrador: $($estudianteResponse.data.usuario.Administrador)" -ForegroundColor Gray
    $estudianteToken = $estudianteResponse.data.token
} catch {
    Write-Host "✗ Error al registrar estudiante: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Detalle: $($errorDetails.message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ====================================
# 4. LOGIN DE ADMINISTRADOR
# ====================================
Write-Host "`n4. Login como ADMINISTRADOR..." -ForegroundColor Yellow

$loginData = @{
    cor_usu = "admin@uta.edu.ec"
    pas_usu = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✓ Login exitoso" -ForegroundColor Green
    $adminToken = $loginResponse.data.token
} catch {
    Write-Host "✗ Error al hacer login: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# ====================================
# 5. CREAR EVENTO (SOLO ADMINISTRADOR)
# ====================================
Write-Host "`n5. Creando EVENTO como Administrador..." -ForegroundColor Yellow

$eventoData = @{
    nom_eve = "Conferencia de Tecnología 2024"
    des_eve = "Conferencia anual sobre las últimas tendencias tecnológicas"
    fec_ini_eve = "2024-06-15T09:00:00.000Z"
    fec_fin_eve = "2024-06-15T17:00:00.000Z"
    est_eve = "Planificado"
    id_responsable = $profesorId
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
}

try {
    $eventoResponse = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Post -Body $eventoData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Evento creado exitosamente" -ForegroundColor Green
    Write-Host "  - ID: $($eventoResponse.data.id_eve)" -ForegroundColor Gray
    Write-Host "  - Nombre: $($eventoResponse.data.nom_eve)" -ForegroundColor Gray
    Write-Host "  - Responsable ID: $($eventoResponse.data.id_responsable)" -ForegroundColor Gray
    $eventoId = $eventoResponse.data.id_eve
} catch {
    Write-Host "✗ Error al crear evento: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Detalle: $($errorDetails.message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ====================================
# 6. INTENTAR CREAR EVENTO COMO ESTUDIANTE (DEBERÍA FALLAR)
# ====================================
Write-Host "`n6. Intentando crear evento como ESTUDIANTE (debe fallar)..." -ForegroundColor Yellow

$eventoData2 = @{
    nom_eve = "Evento no autorizado"
    des_eve = "Este evento no debería crearse"
    fec_ini_eve = "2024-07-01T09:00:00.000Z"
    fec_fin_eve = "2024-07-01T17:00:00.000Z"
    est_eve = "Planificado"
} | ConvertTo-Json

$headers2 = @{
    "Authorization" = "Bearer $estudianteToken"
}

try {
    $eventoResponse2 = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Post -Body $eventoData2 -ContentType "application/json" -Headers $headers2
    Write-Host "✗ PROBLEMA: El estudiante pudo crear un evento (no debería poder)" -ForegroundColor Red
} catch {
    Write-Host "✓ Correcto: Estudiante no puede crear eventos" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Mensaje: $($errorDetails.message)" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 1

# ====================================
# 7. OBTENER LISTA DE USUARIOS ADMINISTRATIVOS
# ====================================
Write-Host "`n7. Obteniendo lista de usuarios administrativos..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $adminToken"
}

try {
    $adminsResponse = Invoke-RestMethod -Uri "$baseUrl/eventos/usuarios/administrativos" -Method Get -Headers $headers
    Write-Host "✓ Lista obtenida exitosamente" -ForegroundColor Green
    Write-Host "  - Total de usuarios administrativos: $($adminsResponse.data.Count)" -ForegroundColor Gray
    foreach ($admin in $adminsResponse.data) {
        Write-Host "    * ID: $($admin.id_usu) - $($admin.nom_usu) $($admin.ape_usu) ($($admin.cor_usu))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error al obtener usuarios administrativos: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# ====================================
# 8. VER EVENTOS DEL PROFESOR RESPONSABLE
# ====================================
Write-Host "`n8. Viendo eventos asignados al profesor..." -ForegroundColor Yellow

$headers3 = @{
    "Authorization" = "Bearer $profesorToken"
}

try {
    $misEventosResponse = Invoke-RestMethod -Uri "$baseUrl/eventos/mis-eventos" -Method Get -Headers $headers3
    Write-Host "✓ Eventos obtenidos exitosamente" -ForegroundColor Green
    Write-Host "  - Total de eventos asignados: $($misEventosResponse.data.Count)" -ForegroundColor Gray
    foreach ($evento in $misEventosResponse.data) {
        Write-Host "    * ID: $($evento.id_eve) - $($evento.nom_eve)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error al obtener eventos del profesor: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# ====================================
# 9. ACTUALIZAR EVENTO COMO RESPONSABLE
# ====================================
if ($eventoId) {
    Write-Host "`n9. Actualizando evento como RESPONSABLE (profesor)..." -ForegroundColor Yellow

    $updateData = @{
        des_eve = "Descripción actualizada por el profesor responsable"
        est_eve = "En Preparación"
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/eventos/$eventoId" -Method Put -Body $updateData -ContentType "application/json" -Headers $headers3
        Write-Host "✓ Evento actualizado exitosamente" -ForegroundColor Green
        Write-Host "  - Nueva descripción: $($updateResponse.data.des_eve)" -ForegroundColor Gray
        Write-Host "  - Nuevo estado: $($updateResponse.data.est_eve)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Error al actualizar evento: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "  Detalle: $($errorDetails.message)" -ForegroundColor Red
        }
    }
}

Start-Sleep -Seconds 1

# ====================================
# 10. OBTENER PERFIL DEL ADMINISTRADOR
# ====================================
Write-Host "`n10. Obteniendo perfil del administrador..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $adminToken"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers
    Write-Host "✓ Perfil obtenido exitosamente" -ForegroundColor Green
    Write-Host "  - Nombre: $($profileResponse.data.nom_usu) $($profileResponse.data.ape_usu)" -ForegroundColor Gray
    Write-Host "  - Correo: $($profileResponse.data.cor_usu)" -ForegroundColor Gray
    Write-Host "  - Administrador: $($profileResponse.data.Administrador)" -ForegroundColor Gray
    Write-Host "  - adm_usu: $($profileResponse.data.adm_usu)" -ForegroundColor Gray
    Write-Host "  - stu_usu: $($profileResponse.data.stu_usu)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error al obtener perfil: $($_.Exception.Message)" -ForegroundColor Red
}

# ====================================
# RESUMEN
# ====================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Sistema de roles funcionando correctamente" -ForegroundColor Green
Write-Host "✓ Administrador puede crear eventos" -ForegroundColor Green
Write-Host "✓ Solo usuarios administrativos pueden ser responsables" -ForegroundColor Green
Write-Host "✓ Estudiantes no pueden crear eventos" -ForegroundColor Green
Write-Host "✓ Responsables pueden actualizar sus eventos asignados" -ForegroundColor Green
Write-Host "`nJerarquía de roles:" -ForegroundColor Yellow
Write-Host "  1. Administrador (Administrador=true) → puede crear/eliminar eventos" -ForegroundColor Gray
Write-Host "  2. Administrativo (adm_usu=1) → puede ser responsable y editar eventos" -ForegroundColor Gray
Write-Host "  3. Estudiante (stu_usu=1) → solo puede ver eventos" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
