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

  // 🔹 LISTAR TODAS LAS SOLICITUDES (MIX)
  async getTodasSolicitudes(): Promise<SolicitudResumen[]> {
    const [usuarios, programadores] = await Promise.all([
      this.getSolicitudesUsuarios(),
      this.getSolicitudesProgramadores()
    ]);

    const todas = [...usuarios, ...programadores];

    // Ordenar por fecha DESC
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

  // 🔥 Helper: body Markdown para USUARIO FINAL (RFC)
  private buildUsuarioIssueBody(row: any): string {
    const fecha =
      row.fec_sol instanceof Date
        ? row.fec_sol.toISOString().split('T')[0]
        : String(row.fec_sol);

    const scrNumero = row.num_sol || `SCR-${row.id_sc_usu}`;

    return [
      '# 📝 Formulario de Solicitud de Cambio — Usuario Final',
      '',
      '## 🔢 Información de la Solicitud',
      `Número de Solicitud:  ${scrNumero}`,
      '',
      `Nombre del Proyecto:  ${row.nom_proy}`,
      '',
      `Fecha de Solicitud:  ${fecha}`,
      '',
      '---',
      '',
      '## 👤 Datos del Solicitante',
      `Nombre del Solicitante:  ${row.nom_sol}`,
      `Correo Electrónico:  ${row.cor_sol}`,
      `Número de Contacto:  ${row.tel_sol || 'N/A'}`,
      '',
      '---',
      '',
      '## 🧩 Módulo / Tipo de usuario afectado',
      'Selecciona todas las opciones que apliquen:',
      '',
      '- [ ] Docente',
      '- [ ] Administrador',
      '- [ ] Estudiante',
      '- [ ] Responsable',
      '- [ ] Usuario logueado',
      '- [ ] Usuario no logueado',
      '- [ ] Otro: (especificar)',
      '',
      '---',
      '',
      '## 🧾 Detalle del Cambio Solicitado',
      '### Título del Cambio:',
      row.tit_cam,
      '',
      '### Descripción Detallada:',
      row.des_cam || '(Explique qué desea cambiar o agregar en el sistema.)',
      '',
      '### Justificación:',
      row.jus_cam || '(Explique por qué este cambio es necesario y qué problema soluciona.)',
      '',
      '---',
      '',
      '## 📎 Adjuntos',
      '(Opcional — capturas, documentos, videos, etc.)',
      '',
      '---',
      '',
      '## 🔄 Estado del RFC',
      '- [x] Recibido',
      '- [ ] En revisión del Comité',
      '- [ ] Aprobado',
      '- [ ] Rechazado',
      '',
      '---',
      '',
      '## 📌 Metadatos del Sistema',
      `- Módulo: ${row.modulo || 'N/A'}`,
      `- Submódulo: ${row.sub_modulo || 'N/A'}`,
      `- Prioridad: ${row.prioridad}`,
      `- Estado Comité: ${row.apv_cam}`,
      `- Fecha creación: ${fecha}`
    ].join('\n');
  }

  // 🔥 Helper: body Markdown para PROGRAMADOR / DESARROLLADOR
  private buildProgramadorIssueBody(row: any): string {
    const fecha =
      row.fec_sol instanceof Date
        ? row.fec_sol.toISOString().split('T')[0]
        : String(row.fec_sol);

    const scrNumero = row.num_sol || `SCR-${row.id_sc_prog}`;

    return [
      '---',
      'Nombre: "🧑‍💻 Solicitud de Cambio Desarrollador"',
      'Descripción: Registrar el análisis técnico y la implementación requerida para un cambio aprobado.',
      `Titulo: "DEV - ${row.tit_cam}"`,
      'Tags: ["desarrollo", "implementación"]',
      `Solicitante: "${row.nom_sol}"`,
      `Desarrollador Asignado: ${row.nom_sol || '[nombre-del-desarrollador]'}`,
      '---',
      '',
      '# 🧑‍💻 Formulario de Solicitud de Cambio — Desarrollador',
      '',
      '⚠ Este formulario se llena únicamente cuando el RFC (Usuario Final) ha sido aprobado por el Comité de Cambios.',
      '',
      '---',
      '',
      '## 🔗 RFC Relacionado',
      `Número de Solicitud (SCR):  ${scrNumero}`,
      '',
      'Enlace al RFC:',
      '(Ej.: #12)',
      '',
      '---',
      '',
      '## 🧩 Módulos afectados',
      'Selecciona todos los módulos que impacta este cambio:',
      '',
      '- [ ] Docente',
      '- [ ] Administrador',
      '- [ ] Estudiante',
      '- [ ] Responsable',
      '- [ ] Usuario logueado',
      '- [ ] Usuario no logueado',
      '- [ ] Otro: (especificar)',
      '',
      '---',
      '',
      '## 📝 Datos Técnicos del Cambio',
      '',
      '### 🔧 Título del Cambio',
      row.tit_cam,
      '',
      '### 🔧 Descripción Detallada',
      row.des_cam || '(Describir técnicamente qué se modificará, añadirá o eliminará)',
      '',
      '### 🧠 Justificación Técnica',
      row.jus_cam || '(Por qué es necesario este cambio desde el punto de vista del desarrollador)',
      '',
      '### ⚠ Impacto de No Implementar el Cambio',
      row.imp_alc || '(Consecuencias, fallos posibles, procesos afectados)',
      '',
      '---',
      '',
      '## 🏷 Tipo de Cambio y Clasificación',
      '',
      '### Tipo de Cambio',
      'Selecciona solo una opción:',
      '',
      '- [ ] Normal',
      '- [ ] Estándar',
      '- [ ] Emergencia',
      '',
      '### Clasificación (según el tipo elegido)',
      '',
      'Si el Tipo de Cambio es Normal:',
      '',
      '- [ ] Funcional',
      '- [ ] Técnico',
      '- [ ] Documental',
      '',
      'Si el Tipo de Cambio es Estándar:',
      '',
      '- [ ] Mantenimiento',
      '- [ ] Actualización',
      '',
      'Si el Tipo de Cambio es Emergencia:',
      '',
      '- [ ] Crítico',
      '- [ ] Seguridad',
      '',
      '---',
      '',
      '## 📊 Impactos y Estimación',
      '',
      '### 🎯 Impacto en el Alcance',
      row.imp_alc || '(Módulos afectados, pantallas, endpoints, procesos)',
      '',
      '### 🕒 Impacto en Días / Tiempo Estimado',
      String(row.imp_dias ?? '(Especificar tiempo aproximado de desarrollo)'),
      '',
      '---',
      '',
      '## 🧰 Recursos Necesarios',
      row.rec_nec || '(Personas, accesos, herramientas, datos o APIs necesarias)',
      '',
      '---',
      '',
      '## ⚠ Riesgos Identificados',
      row.riesgos || '(Riesgos técnicos, regresiones, dependencias)',
      '',
      '---',
      '',
      '## 🌿 Rama de Desarrollo',
      'feature/SCR-xxxx-nombre-del-cambio',
      '',
      '---',
      '',
      '## 📌 Metadatos del Sistema',
      `- Proyecto: ${row.nom_proy}`,
      `- Módulo: ${row.modulo || 'N/A'}`,
      `- Submódulo: ${row.sub_modulo || 'N/A'}`,
      `- Importante / No importante: ${row.imp_no_imp}`,
      `- Tipo de cambio (BD): ${row.tip_cam}`,
      `- Clasificación (BD): ${row.cla_cam}`,
      `- Prioridad: ${row.prioridad}`,
      `- Estado Comité: ${row.apv_cam}`,
      `- Fecha solicitud: ${fecha}`
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

      const title = `RFC - ${row.num_sol || row.id_sc_usu} - ${row.tit_cam}`;
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

      const title = `DEV - ${row.nom_proy} - ${row.tit_cam}`;
      const body = this.buildProgramadorIssueBody(row);
      const labels = ['comite', 'programador'];

      await githubService.createIssue({ title, body, labels });

      return { success: true };
    }

    return { success: false, message: 'Tipo inválido' };
  }
}
