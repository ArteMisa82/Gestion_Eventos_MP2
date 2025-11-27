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

import certificadosRoutes from './certificados.routes';
import tarifasEventoRoutes from './tarifas-evento.routes';

const router = Router();

// 🔑 Rutas principales
router.use('/auth', authRoutes);
router.use('/user', userRoutes); // ← ruta correcta en singular
router.use('/eventos', eventosRoutes);
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

router.use('/tarifas-evento', tarifasEventoRoutes);

export default router;
