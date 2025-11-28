// backend/src/services/dashboard.service.ts
import prisma from "../config/database";

export interface DashboardSummary {
  cards: {
    totalStudents: number;
    totalEvents: number;
    favoriteEvents: number;
    activeEvents: number;
  };
  statusSummary: {
    nuevos: number;
    enProceso: number;
    finalizados: number;
  };
  distributionByType: Array<{
    tipo: string;
    estudiantes: number;
    porcentaje: number;
  }>;
  recentEvents: Array<{
    id_evt: string;
    nom_evt: string;
    fec_evt: Date;
    tipo: string | null;
    est_evt: string | null;
    inscritos: number;
  }>;
}

export const getDashboardMetrics = async (): Promise<DashboardSummary> => {
  const today = new Date();

  // 1. Cards: totales principales
  const [totalStudents, totalEvents, favoriteEvents] = await Promise.all([
    // Total de estudiantes (tabla estudiantes)
    prisma.estudiantes.count(),
    prisma.eventos.count(),
    prisma.eventos.count({ where: { fav_evt: 1 } }),
  ]);

  // 2. Resumen por estado
  const [nuevos, enProceso, finalizados] = await Promise.all([
    // Nuevos = EDITANDO
    prisma.eventos.count({
      where: { est_evt: "EDITANDO" },
    }),
    // En proceso = PUBLICADO y no finalizado
    prisma.eventos.count({
      where: {
        est_evt: "PUBLICADO",
        OR: [{ fec_fin_evt: null }, { fec_fin_evt: { gte: today } }],
      },
    }),
    // Finalizados = fec_fin_evt < hoy
    prisma.eventos.count({
      where: {
        fec_fin_evt: { lt: today },
      },
    }),
  ]);

  const activeEvents = enProceso; // para la card "Actividad actual"

  // 3. Distribución por tipo de evento (por inscripciones)
  const rawDistribution = await prisma.$queryRaw<
    Array<{ tipo: string | null; inscritos: bigint }>
  >`
    SELECT
      d.tip_evt AS tipo,
      COUNT(rp.num_reg_per) AS inscritos
    FROM detalle_eventos d
    JOIN registro_evento re ON re.id_det = d.id_det
    JOIN registro_personas rp ON rp.id_reg_evt = re.id_reg_evt
    GROUP BY d.tip_evt
    ORDER BY inscritos DESC;
  `;

  const totalInscritosDist = rawDistribution.reduce(
    (acc, row) => acc + Number(row.inscritos),
    0
  );

  const distributionByType = rawDistribution.map((row) => ({
    tipo: row.tipo ?? "SIN TIPO",
    estudiantes: Number(row.inscritos),
    porcentaje:
      totalInscritosDist === 0
        ? 0
        : Number(
            ((Number(row.inscritos) / totalInscritosDist) * 100).toFixed(2)
          ),
  }));

  // 4. Eventos recientes: eventos que recientemente pasaron
  //    -> Solo eventos con fec_evt < hoy
  //    -> Ordenados del más reciente al menos reciente
  //    -> Máximo 5
  const recentEventsRaw = await prisma.$queryRaw<
    Array<{
      id_evt: string;
      nom_evt: string;
      fec_evt: Date;
      est_evt: string | null;
      tipo: string | null;
      inscritos: bigint;
    }>
  >`
    SELECT
      e.id_evt,
      e.nom_evt,
      e.fec_evt,
      e.est_evt,
      MAX(d.tip_evt) AS tipo,
      COUNT(rp.num_reg_per) AS inscritos
    FROM eventos e
    LEFT JOIN detalle_eventos d ON d.id_evt_per = e.id_evt
    LEFT JOIN registro_evento re ON re.id_det = d.id_det
    LEFT JOIN registro_personas rp ON rp.id_reg_evt = re.id_reg_evt
    WHERE e.fec_evt < CURRENT_DATE
    GROUP BY e.id_evt, e.nom_evt, e.fec_evt, e.est_evt
    ORDER BY e.fec_evt DESC
    LIMIT 5;
  `;

  const recentEvents = recentEventsRaw.map((row) => ({
    id_evt: row.id_evt,
    nom_evt: row.nom_evt,
    fec_evt: row.fec_evt,
    tipo: row.tipo,
    est_evt: row.est_evt,
    inscritos: Number(row.inscritos),
  }));

  return {
    cards: {
      totalStudents,
      totalEvents,
      favoriteEvents,
      activeEvents,
    },
    statusSummary: {
      nuevos,
      enProceso,
      finalizados,
    },
    distributionByType,
    recentEvents,
  };
};
