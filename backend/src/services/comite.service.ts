// src/services/comite.service.ts
import { PrismaClient } from '../generated/prisma';
import { GitHubService } from './github.service';

const prisma = new PrismaClient();
const githubService = new GitHubService();

export interface ComiteMember {
  id_sc_com: number;
  nom_com: string;
  ape_com: string;
  cor_com: string;
}

export interface SolicitudResumen {
  id: number;
  tipo: 'USUARIO' | 'PROGRAMADOR';
  num_sol?: string;        // Solo para sc_usuarios
  nom_proy: string;
  tit_cam: string;
  nom_sol: string;
  cor_sol: string;
  fec_sol: string;         // ISO string
  apv_cam: string;
  prioridad: string;
}

export class ComiteService {
  // 🔹 LOGIN COMITÉ
  async loginComite(cor_com: string, tok_seg: string): Promise<ComiteMember | null> {
    const miembro = await prisma.sc_comite.findUnique({
      where: { cor_com }
    });

    if (!miembro) return null;
    if (miembro.tok_seg !== tok_seg) return null;

    return {
      id_sc_com: miembro.id_sc_com,
      nom_com: miembro.nom_com,
      ape_com: miembro.ape_com,
      cor_com: miembro.cor_com
    };
  }

  // 🔹 LISTAR MIEMBROS COMITÉ
  async getMiembros(): Promise<ComiteMember[]> {
    const miembros = await prisma.sc_comite.findMany({
      select: {
        id_sc_com: true,
        nom_com: true,
        ape_com: true,
        cor_com: true
      }
    });

    return miembros;
  }

  // 🔹 LISTAR SOLICITUDES (USUARIOS)
  async getSolicitudesUsuarios(): Promise<SolicitudResumen[]> {
    const rows = await prisma.sc_usuarios.findMany({
      orderBy: { fec_sol: 'desc' }
    });

    return rows.map((row) => ({
      id: row.id_sc_usu,
      tipo: 'USUARIO',
      num_sol: row.num_sol,
      nom_proy: row.nom_proy,
      tit_cam: row.tit_cam,
      nom_sol: row.nom_sol,
      cor_sol: row.cor_sol,
      fec_sol: row.fec_sol.toISOString(),
      apv_cam: row.apv_cam,
      prioridad: row.prioridad
    }));
  }

  // 🔹 LISTAR SOLICITUDES (PROGRAMADORES)
  async getSolicitudesProgramadores(): Promise<SolicitudResumen[]> {
    const rows = await prisma.sc_programadores.findMany({
      orderBy: { fec_sol: 'desc' }
    });

    return rows.map((row) => ({
      id: row.id_sc_prog,
      tipo: 'PROGRAMADOR',
      nom_proy: row.nom_proy,
      tit_cam: row.tit_cam,
      nom_sol: row.nom_sol,
      cor_sol: row.cor_sol,
      fec_sol: row.fec_sol.toISOString(),
      apv_cam: row.apv_cam,
      prioridad: row.prioridad
    }));
  }

  // 🔹 LISTAR TODAS LAS SOLICITUDES
  async getTodasSolicitudes(): Promise<SolicitudResumen[]> {
    const [usuarios, programadores] = await Promise.all([
      this.getSolicitudesUsuarios(),
      this.getSolicitudesProgramadores()
    ]);

    const todas = [...usuarios, ...programadores];

    todas.sort((a, b) => {
      const fa = new Date(a.fec_sol).getTime();
      const fb = new Date(b.fec_sol).getTime();
      return fb - fa;
    });

    return todas;
  }

  // 🔹 DETALLE SOLICITUD USUARIO
  async getSolicitudUsuarioById(id: number) {
    return prisma.sc_usuarios.findUnique({
      where: { id_sc_usu: id }
    });
  }

  // 🔹 DETALLE SOLICITUD PROGRAMADOR
  async getSolicitudProgramadorById(id: number) {
    return prisma.sc_programadores.findUnique({
      where: { id_sc_prog: id }
    });
  }

  // 🔥 Helper: body Markdown para USUARIO
  private buildUsuarioIssueBody(row: any): string {
    const fecha = row.fec_sol instanceof Date ? row.fec_sol.toISOString().split('T')[0] : String(row.fec_sol);

    return [
      `### Tipo de solicitud`,
      `Usuario`,
      ``,
      `### Datos del solicitante`,
      `- Nombre: ${row.nom_sol}`,
      `- Correo: ${row.cor_sol}`,
      `- Teléfono: ${row.tel_sol || 'N/A'}`,
      ``,
      `### Proyecto`,
      `- Nombre: ${row.nom_proy}`,
      `- Módulo: ${row.modulo || 'N/A'}`,
      `- Submódulo: ${row.sub_modulo || 'N/A'}`,
      ``,
      `### Detalle del cambio`,
      `- Título: ${row.tit_cam}`,
      ``,
      `**Descripción:**`,
      `${row.des_cam || 'Sin descripción'}`,
      ``,
      `**Justificación:**`,
      `${row.jus_cam || 'Sin justificación'}`,
      ``,
      `### Priorización`,
      `- Estado en comité: ${row.apv_cam}`,
      `- Prioridad: ${row.prioridad}`,
      ``,
      `### Metadatos`,
      `- Número de solicitud: ${row.num_sol}`,
      `- Fecha de solicitud: ${fecha}`
    ].join('\n');
  }

  // 🔥 Helper: body Markdown para PROGRAMADOR
  private buildProgramadorIssueBody(row: any): string {
    const fecha = row.fec_sol instanceof Date ? row.fec_sol.toISOString().split('T')[0] : String(row.fec_sol);

    return [
      `### Tipo de solicitud`,
      `Programador`,
      ``,
      `### Datos del solicitante`,
      `- Nombre: ${row.nom_sol}`,
      `- Correo: ${row.cor_sol}`,
      `- Teléfono: ${row.tel_sol || 'N/A'}`,
      ``,
      `### Proyecto`,
      `- Nombre: ${row.nom_proy}`,
      `- Módulo: ${row.modulo || 'N/A'}`,
      `- Submódulo: ${row.sub_modulo || 'N/A'}`,
      ``,
      `### Detalle del cambio`,
      `- Título: ${row.tit_cam}`,
      ``,
      `**Descripción técnica:**`,
      `${row.des_cam || 'Sin descripción'}`,
      ``,
      `**Justificación técnica:**`,
      `${row.jus_cam || 'Sin justificación'}`,
      ``,
      `### Impacto y clasificación`,
      `- Importante / No importante: ${row.imp_no_imp}`,
      `- Tipo de cambio: ${row.tip_cam}`,
      `- Clasificación: ${row.cla_cam}`,
      `- Alcance: ${row.imp_alc || 'N/A'}`,
      `- Días estimados de implementación: ${row.imp_dias ?? 'N/A'}`,
      ``,
      `### Recursos y riesgos`,
      `- Recursos necesarios: ${row.rec_nec || 'N/A'}`,
      `- Riesgos: ${row.riesgos || 'N/A'}`,
      ``,
      `### Priorización`,
      `- Estado en comité: ${row.apv_cam}`,
      `- Prioridad: ${row.prioridad}`,
      ``,
      `### Metadatos`,
      `- ID solicitud programador: ${row.id_sc_prog}`,
      `- Fecha de solicitud: ${fecha}`
    ].join('\n');
  }

  // 🔹 EDITAR SOLICITUD USUARIO (SIN GitHub automático)
  async updateSolicitudUsuario(
    id: number,
    data: Partial<{
      nom_proy: string;
      nom_sol: string;
      cor_sol: string;
      tel_sol: string;
      tit_cam: string;
      des_cam: string;
      jus_cam: string | null;
      modulo: string;
      sub_modulo: string | null;
      apv_cam: string;
      prioridad: string;
    }>
  ) {
    const existing = await prisma.sc_usuarios.findUnique({
      where: { id_sc_usu: id }
    });

    if (!existing) return null;

    return prisma.sc_usuarios.update({
      where: { id_sc_usu: id },
      data
    });
  }

  // 🔹 EDITAR SOLICITUD PROGRAMADOR (SIN GitHub automático)
  async updateSolicitudProgramador(
    id: number,
    data: Partial<{
      nom_proy: string;
      nom_sol: string;
      cor_sol: string;
      tel_sol: string;
      tit_cam: string;
      des_cam: string;
      jus_cam: string | null;
      modulo: string;
      sub_modulo: string | null;
      imp_no_imp: string;
      tip_cam: string;
      cla_cam: string;
      imp_alc: string | null;
      imp_dias: number | null;
      rec_nec: string | null;
      riesgos: string | null;
      apv_cam: string;
      prioridad: string;
    }>
  ) {
    const existing = await prisma.sc_programadores.findUnique({
      where: { id_sc_prog: id }
    });

    if (!existing) return null;

    return prisma.sc_programadores.update({
      where: { id_sc_prog: id },
      data
    });
  }

  // 📌 PUBLICAR MANUALMENTE UNA SOLICITUD A GITHUB (BOTÓN)
  async publicarSolicitudEnGitHub(tipo: 'USUARIO' | 'PROGRAMADOR', id: number) {
    if (tipo === 'USUARIO') {
      const row = await prisma.sc_usuarios.findUnique({
        where: { id_sc_usu: id }
      });

      if (!row) return { success: false, message: 'Solicitud usuario no encontrada' };

      const title = `[USUARIO] ${row.nom_proy} - ${row.tit_cam}`;
      const body = this.buildUsuarioIssueBody(row);
      const labels = ['comite', 'usuario'];

      await githubService.createIssue({ title, body, labels });

      return { success: true };
    }

    if (tipo === 'PROGRAMADOR') {
      const row = await prisma.sc_programadores.findUnique({
        where: { id_sc_prog: id }
      });

      if (!row) return { success: false, message: 'Solicitud programador no encontrada' };

      const title = `[PROGRAMADOR] ${row.nom_proy} - ${row.tit_cam}`;
      const body = this.buildProgramadorIssueBody(row);
      const labels = ['comite', 'programador'];

      await githubService.createIssue({ title, body, labels });

      return { success: true };
    }

    return { success: false, message: 'Tipo inválido' };
  }
}
