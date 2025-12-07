// src/routes/index.ts
import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import detallesRoutes from './detalles.routes';
import registroEventoRoutes from './registro-evento.routes';
import registroPersonasRoutes from './registro-personas.routes';
import inscripcionesRoutes from './inscripciones.routes';
import estudiantesRoutes from './estudiantes.routes';
import carrerasRoutes from './carreras.routes';
import nivelesRoutes from './niveles.routes';
import pagosRoutes from './pagos.routes';
import materialesRoutes from './materiales.routes';
import calificacionesRoutes from './calificaciones.routes';
import comiteRoutes from './comite.routes'; // 👈 NUEVO
import certificadosRoutes from './certificados.routes';
import tarifasEventoRoutes from './tarifas-evento.routes';
import requisitosRoutes from './requisitos.routes';

// 👉 IMPORTAR LAS RUTAS NUEVAS AQUÍ
import favoriteEventsRoutes from './favoriteEvents.routes';

const router = Router();

// 🔑 Rutas principales
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/eventos', eventosRoutes);

// 👉 AGREGAR ESTA RUTA **ANTES O DESPUÉS**, PERO DEBE ESTAR
router.use('/eventos', favoriteEventsRoutes);

router.use('/detalles', detallesRoutes);
router.use('/registro-evento', registroEventoRoutes);
router.use('/registro-personas', registroPersonasRoutes);
router.use('/inscripciones', inscripcionesRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/carreras', carrerasRoutes);
router.use('/niveles', nivelesRoutes);
router.use('/pagos', pagosRoutes);
router.use('/materiales', materialesRoutes);
router.use('/calificaciones', calificacionesRoutes);
router.use('/certificados', certificadosRoutes);
router.use('/requisitos', requisitosRoutes);

router.use('/tarifas-evento', tarifasEventoRoutes);
router.use('/api/certificados-usuario', certificadosRoutes);
// 👇 ESTA LÍNEA FALTABA
router.use('/comite', comiteRoutes);

export default router;
