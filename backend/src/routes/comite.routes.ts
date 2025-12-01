import { Router } from 'express';
import { ComiteController } from '../controllers/comite.controller';
import { requireAuth } from '../middlewares/session.middleware';
import { requireComite } from '../middlewares/comite.middleware';

const router = Router();
const controller = new ComiteController();

// ==============================
// 🔐 SESIÓN DEL COMITÉ (solo admin logueado)
// ==============================
router.post('/login', requireAuth, controller.login.bind(controller));
router.get('/session', requireAuth, controller.getCurrentSession.bind(controller));
router.get('/estado', requireAuth, controller.getEstado.bind(controller));
router.get('/miembros', requireAuth, controller.getMiembros.bind(controller));
router.post('/logout', requireAuth, controller.logout.bind(controller));

// ==============================
// 📋 SOLICITUDES DE CAMBIOS
// ==============================

// ⭐ NUEVA RUTA GENERAL
router.get(
  '/solicitudes',
  requireAuth,
  requireComite,
  controller.getTodasSolicitudes.bind(controller)
);

// Usuarios
router.get(
  '/solicitudes/usuarios',
  requireAuth,
  requireComite,
  controller.getSolicitudesUsuarios.bind(controller)
);

router.get(
  '/solicitudes/usuarios/:id',
  requireAuth,
  requireComite,
  controller.getSolicitudUsuarioById.bind(controller)
);

router.patch(
  '/solicitudes/usuarios/:id',
  requireAuth,
  requireComite,
  controller.updateSolicitudUsuario.bind(controller)
);

// Programadores
router.get(
  '/solicitudes/programadores',
  requireAuth,
  requireComite,
  controller.getSolicitudesProgramadores.bind(controller)
);

router.get(
  '/solicitudes/programadores/:id',
  requireAuth,
  requireComite,
  controller.getSolicitudProgramadorById.bind(controller)
);

router.patch(
  '/solicitudes/programadores/:id',
  requireAuth,
  requireComite,
  controller.updateSolicitudProgramador.bind(controller)
);
// ⭐ PUBLICAR MANUALMENTE A GITHUB ⭐
router.post(
  '/solicitudes/:tipo/:id/github',
  requireAuth,
  requireComite,
  controller.publicarEnGitHub.bind(controller)
);


export default router;
