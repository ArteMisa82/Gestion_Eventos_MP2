# 🔐 Política de Seguridad – Gestión de Eventos Académicos (FISEI)

Este documento reúne las prácticas de seguridad adoptadas por el **Equipo de Desarrollo – Grupo 3 – Carrera de Software (UTA)** para proteger la integridad del sistema y la información manejada.

---

## 📣 Reporte de Vulnerabilidades
Si identificas una vulnerabilidad:

1. No la publiques en espacios públicos.  
2. Registra un Issue privado o comunícate con el equipo.  
3. Incluye pasos para reproducir, capturas y módulo afectado.

Los reportes se revisan en un plazo de hasta **72 horas**.

---

## 🔐 Protección de Datos
El proyecto maneja:

- Información personal (nombres, correos).  
- Registros de asistencia.  
- Comprobantes de pago.  
- Información académica básica.

Está prohibido:

- Subir `.env` al repositorio.  
- Compartir tokens, claves o contraseñas por mensajes públicos.  
- Exponer capturas sin ocultar datos sensibles.  
- Enviar información privada mediante Issues abiertos.

---

## 🔧 Buenas Prácticas Técnicas
- Validación de datos del usuario.  
- Sanitización para evitar XSS o inyección.  
- Uso de `express-session` con almacenamiento seguro.  
- Revisión periódica de dependencias (`npm audit`).  
- Uso de HTTPS en ambientes productivos.  
- Protección de endpoints sensibles según rol.

---

## 🚨 Respuesta ante Incidentes
1. Registrar el problema en Issues (modo privado si es sensible).  
2. Clasificar severidad (crítico / medio / bajo).  
3. Aplicar parche o hotfix.  
4. Documentar la resolución.

---

## 🤝 Contacto
La información de contacto del grupo será incluida en GitHub.
