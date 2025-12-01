// src/controllers/comite.controller.ts
import { Request, Response } from 'express';
import { ComiteService } from '../services/comite.service';

export class ComiteController {
  private service: ComiteService;

  constructor() {
    this.service = new ComiteService();
  }

  // POST /api/comite/login
  async login(req: Request, res: Response) {
    try {
      const { cor_com, tok_seg } = req.body;

      if (!cor_com || !tok_seg) {
        return res.status(400).json({
          success: false,
          message: 'El correo y el token del comité son obligatorios'
        });
      }

      const isAuthenticated = (req.session as any).isAuthenticated;
      const userRole = (req.session as any).userRole;

      // Solo admin puede iniciar sesión como comité
      if (!isAuthenticated || userRole !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo un administrador puede iniciar sesión como comité'
        });
      }

      const miembro = await this.service.loginComite(cor_com, tok_seg);

      if (!miembro) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales de comité inválidas'
        });
      }

      // Guardar info de comité en sesión
      (req.session as any).comite = miembro;
      (req.session as any).comiteLoginAt = new Date().toISOString();

      return res.json({
        success: true,
        message: 'Sesión de comité iniciada correctamente',
        data: miembro
      });
    } catch (error) {
      console.error('Error en login de comité:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/comite/session
  async getCurrentSession(req: Request, res: Response) {
    const comite = (req.session as any).comite;
    const comiteLoginAt = (req.session as any).comiteLoginAt;

    if (!comite) {
      return res.status(404).json({
        success: false,
        message: 'No hay una sesión de comité activa'
      });
    }

    return res.json({
      success: true,
      data: {
        ...comite,
        loginAt: comiteLoginAt || null
      }
    });
  }

  // GET /api/comite/estado
  async getEstado(req: Request, res: Response) {
    const comite = (req.session as any).comite;
    const comiteLoginAt = (req.session as any).comiteLoginAt;

    return res.json({
      success: true,
      data: {
        activo: !!comite,
        miembro: comite || null,
        loginAt: comite ? comiteLoginAt || null : null
      }
    });
  }

  // GET /api/comite/miembros
  async getMiembros(req: Request, res: Response) {
    try {
      const isAuthenticated = (req.session as any).isAuthenticated;
      const userRole = (req.session as any).userRole;

      if (!isAuthenticated || userRole !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo un administrador puede listar los miembros del comité'
        });
      }

      const miembros = await this.service.getMiembros();

      return res.json({
        success: true,
        data: miembros
      });
    } catch (error) {
      console.error('Error obteniendo miembros de comité:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/comite/logout
  async logout(req: Request, res: Response) {
    if ((req.session as any).comite) {
      delete (req.session as any).comite;
    }
    if ((req.session as any).comiteLoginAt) {
      delete (req.session as any).comiteLoginAt;
    }

    return res.json({
      success: true,
      message: 'Sesión de comité cerrada correctamente'
    });
  }

  // ============================
  //   SOLICITUDES - LISTADO
  // ============================

  // GET /api/comite/solicitudes
  async getTodasSolicitudes(req: Request, res: Response) {
    try {
      const tipoParam = (req.query.tipo as string | undefined)?.toUpperCase();

      if (tipoParam === 'USUARIO') {
        const usuarios = await this.service.getSolicitudesUsuarios();
        return res.json({
          success: true,
          data: usuarios
        });
      }

      if (tipoParam === 'PROGRAMADOR' || tipoParam === 'PROGRAMADORES') {
        const programadores = await this.service.getSolicitudesProgramadores();
        return res.json({
          success: true,
          data: programadores
        });
      }

      // Si no hay tipo → devolver todas mezcladas
      const todas = await this.service.getTodasSolicitudes();
      return res.json({
        success: true,
        data: todas
      });
    } catch (error) {
      console.error('Error obteniendo todas las solicitudes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo todas las solicitudes'
      });
    }
  }

  // GET /api/comite/solicitudes/usuarios
  async getSolicitudesUsuarios(req: Request, res: Response) {
    try {
      const solicitudes = await this.service.getSolicitudesUsuarios();
      return res.json({
        success: true,
        data: solicitudes
      });
    } catch (error) {
      console.error('Error obteniendo solicitudes de usuarios:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitudes de usuarios'
      });
    }
  }

  // GET /api/comite/solicitudes/programadores
  async getSolicitudesProgramadores(req: Request, res: Response) {
    try {
      const solicitudes = await this.service.getSolicitudesProgramadores();
      return res.json({
        success: true,
        data: solicitudes
      });
    } catch (error) {
      console.error('Error obteniendo solicitudes de programadores:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitudes de programadores'
      });
    }
  }

  // ============================
  //   SOLICITUDES - DETALLE
  // ============================

  // GET /api/comite/solicitudes/usuarios/:id
  async getSolicitudUsuarioById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const solicitud = await this.service.getSolicitudUsuarioById(id);
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      return res.json({
        success: true,
        data: solicitud
      });
    } catch (error) {
      console.error('Error obteniendo solicitud de usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitud de usuario'
      });
    }
  }

  // GET /api/comite/solicitudes/programadores/:id
  async getSolicitudProgramadorById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const solicitud = await this.service.getSolicitudProgramadorById(id);
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      return res.json({
        success: true,
        data: solicitud
      });
    } catch (error) {
      console.error('Error obteniendo solicitud de programador:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitud de programador'
      });
    }
  }

  // ============================
  //   SOLICITUDES - EDICIÓN
  // ============================

  // PATCH /api/comite/solicitudes/usuarios/:id
  async updateSolicitudUsuario(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const {
        nom_proy,
        nom_sol,
        cor_sol,
        tel_sol,
        tit_cam,
        des_cam,
        jus_cam,
        modulo,
        sub_modulo,
        apv_cam,
        prioridad
      } = req.body;

      const data: any = {};
      if (nom_proy !== undefined) data.nom_proy = nom_proy;
      if (nom_sol !== undefined) data.nom_sol = nom_sol;
      if (cor_sol !== undefined) data.cor_sol = cor_sol;
      if (tel_sol !== undefined) data.tel_sol = tel_sol;
      if (tit_cam !== undefined) data.tit_cam = tit_cam;
      if (des_cam !== undefined) data.des_cam = des_cam;
      if (jus_cam !== undefined) data.jus_cam = jus_cam;
      if (modulo !== undefined) data.modulo = modulo;
      if (sub_modulo !== undefined) data.sub_modulo = sub_modulo;
      if (apv_cam !== undefined) data.apv_cam = apv_cam;
      if (prioridad !== undefined) data.prioridad = prioridad;

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron campos para actualizar'
        });
      }

      const updated = await this.service.updateSolicitudUsuario(id, data);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      return res.json({
        success: true,
        message: 'Solicitud de usuario actualizada correctamente',
        data: updated
      });
    } catch (error) {
      console.error('Error actualizando solicitud de usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error actualizando solicitud de usuario'
      });
    }
  }

  // PATCH /api/comite/solicitudes/programadores/:id
  async updateSolicitudProgramador(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const {
        nom_proy,
        nom_sol,
        cor_sol,
        tel_sol,
        tit_cam,
        des_cam,
        jus_cam,
        modulo,
        sub_modulo,
        imp_no_imp,
        tip_cam,
        cla_cam,
        imp_alc,
        imp_dias,
        rec_nec,
        riesgos,
        apv_cam,
        prioridad
      } = req.body;

      const data: any = {};
      if (nom_proy !== undefined) data.nom_proy = nom_proy;
      if (nom_sol !== undefined) data.nom_sol = nom_sol;
      if (cor_sol !== undefined) data.cor_sol = cor_sol;
      if (tel_sol !== undefined) data.tel_sol = tel_sol;
      if (tit_cam !== undefined) data.tit_cam = tit_cam;
      if (des_cam !== undefined) data.des_cam = des_cam;
      if (jus_cam !== undefined) data.jus_cam = jus_cam;
      if (modulo !== undefined) data.modulo = modulo;
      if (sub_modulo !== undefined) data.sub_modulo = sub_modulo;
      if (imp_no_imp !== undefined) data.imp_no_imp = imp_no_imp;
      if (tip_cam !== undefined) data.tip_cam = tip_cam;
      if (cla_cam !== undefined) data.cla_cam = cla_cam;
      if (imp_alc !== undefined) data.imp_alc = imp_alc;
      if (imp_dias !== undefined) data.imp_dias = imp_dias;
      if (rec_nec !== undefined) data.rec_nec = rec_nec;
      if (riesgos !== undefined) data.riesgos = riesgos;
      if (apv_cam !== undefined) data.apv_cam = apv_cam;
      if (prioridad !== undefined) data.prioridad = prioridad;

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron campos para actualizar'
        });
      }

      const updated = await this.service.updateSolicitudProgramador(id, data);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      return res.json({
        success: true,
        message: 'Solicitud de programador actualizada correctamente',
        data: updated
      });
    } catch (error) {
      console.error('Error actualizando solicitud de programador:', error);
      return res.status(500).json({
        success: false,
        message: 'Error actualizando solicitud de programador'
      });
    }
  }
    // POST /api/comite/solicitudes/:tipo/:id/github
  async publicarEnGitHub(req: Request, res: Response) {
    try {
      const tipoParam = req.params.tipo.toLowerCase();
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }

      let tipo: 'USUARIO' | 'PROGRAMADOR';

      if (tipoParam === 'usuario' || tipoParam === 'usuarios') tipo = 'USUARIO';
      else if (tipoParam === 'programador' || tipoParam === 'programadores') tipo = 'PROGRAMADOR';
      else {
        return res.status(400).json({ success: false, message: 'Tipo inválido' });
      }

      const result = await this.service.publicarSolicitudEnGitHub(tipo, id);

      if (!result.success) {
        return res.status(404).json({ success: false, message: result.message });
      }

      return res.json({
        success: true,
        message: `Solicitud ${tipo} #${id} publicada en GitHub correctamente`
      });
    } catch (error) {
      console.error('Error publicando Issue en GitHub:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al publicar Issue'
      });
    }
  }

}
