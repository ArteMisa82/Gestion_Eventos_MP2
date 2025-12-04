import prisma from "../config/database"; 

export interface Evento {
  id_evt: string;
  nom_evt: string;
  fec_evt: Date;
  lug_evt: string | null;
  mod_evt: string | null;
  tip_pub_evt: string | null;
  cos_evt: string | null;
  des_evt: string | null;
  id_res_evt: number | null;
  est_evt: string;
  ima_evt: string | null;
  fec_fin_evt: Date | null;
  fav_evt: number;
}

/**
 * Marca o desmarca un evento como favorito.
 * Reglas:
 *  - Solo se pueden marcar como favoritos eventos PUBLICADOS.
 *  - No se puede marcar favorito si el evento ya terminó.
 *  - Máximo puede haber 6 eventos con fav_evt = 1.
 */
export const setFavoritoEvento = async (
  id_evt: string,
  makeFavorite: boolean
) => {
  // 1. Buscar el evento
  const evento = await prisma.eventos.findUnique({
    where: {
      id_evt: id_evt,
    },
    select: {
      id_evt: true,
      est_evt: true,
      fec_fin_evt: true,
      fav_evt: true,
    },
  });

  if (!evento) {
    throw new Error("El evento no existe.");
  }

  // 2. Validaciones solo si lo quiero marcar como favorito
  if (makeFavorite) {
    // 2.1 Debe estar PUBLICADO
    if (evento.est_evt !== "PUBLICADO") {
      throw new Error(
        "Solo se pueden marcar como favoritos eventos PUBLICADOS."
      );
    }

    // 2.2 No debe haber terminado
    if (evento.fec_fin_evt && evento.fec_fin_evt < new Date()) {
      throw new Error(
        "No se puede marcar como favorito un evento que ya terminó."
      );
    }

    // 2.3 Máximo 6 favoritos
    const countFavs = await prisma.eventos.count({
      where: {
        fav_evt: 1,
      },
    });

    if (countFavs >= 6 && evento.fav_evt !== 1) {
      throw new Error(
        "Ya existen 6 eventos favoritos, no puedes agregar otro."
      );
    }
  }

  // 3. Actualizar fav_evt
  const updateResult = await prisma.eventos.update({
    where: {
      id_evt: id_evt,
    },
    data: {
      fav_evt: makeFavorite ? 1 : 0,
    },
  });

  return updateResult;
};

/**
 * Obtiene hasta 6 eventos favoritos para enviarlos al frontend.
 */
export const getEventosFavoritos = async () => {
  const eventos = await prisma.eventos.findMany({
    where: {
      fav_evt: 1,
    },
    orderBy: {
      fec_evt: "asc",
    },
    take: 6,
  });

  return eventos;
};
