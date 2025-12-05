import prisma from "../prisma.config";

interface RequisitoData {
  id_det: string;
  tip_req: string;
  des_req?: string;
  obligatorio?: boolean;
}

interface CompletarRequisitoData {
  num_reg_per: number;
  id_req: number;
  val_req?: string;
}

/**
 * Crear un requisito para un evento
 */
export const crearRequisito = async (data: RequisitoData) => {
  return await prisma.requisitos_evento.create({
    data: {
      id_det: data.id_det,
      tip_req: data.tip_req === "Documento de Identidad" ? "CEDULA" : data.tip_req,
      des_req: data.des_req,
      obligatorio: data.obligatorio ?? true,
    },
  });
};

/**
 * Obtener todos los requisitos de un evento por su ID de detalle
 */
export const obtenerRequisitosPorDetalle = async (idDetalle: string) => {
  return await prisma.requisitos_evento.findMany({
    where: {
      id_det: idDetalle,
    },
    orderBy: {
      id_req: "asc",
    },
  });
};

/**
 * Completar un requisito por un estudiante
 * Si el tipo de requisito es "CEDULA", guarda el valor de la cédula
 * Para otros tipos, guarda el texto proporcionado
 */
export const completarRequisito = async (data: CompletarRequisitoData) => {
  // Verificar si el requisito existe
  const requisito = await prisma.requisitos_evento.findUnique({
    where: { id_req: data.id_req },
  });

  if (!requisito) {
    throw new Error("Requisito no encontrado");
  }

  // Verificar si ya fue completado
  const existente = await prisma.requisitos_persona.findUnique({
    where: {
      num_reg_per_id_req: {
        num_reg_per: data.num_reg_per,
        id_req: data.id_req,
      },
    },
  });

  if (existente) {
    // Actualizar
    return await prisma.requisitos_persona.update({
      where: {
        num_reg_per_id_req: {
          num_reg_per: data.num_reg_per,
          id_req: data.id_req,
        },
      },
      data: {
        val_req: data.val_req,
        fec_val: new Date(),
      },
    });
  }

  // Crear nuevo
  return await prisma.requisitos_persona.create({
    data: {
      num_reg_per: data.num_reg_per,
      id_req: data.id_req,
      val_req: data.val_req,
      fec_val: new Date(),
    },
  });
};

/**
 * Verificar si todos los requisitos obligatorios están completos
 */
export const verificarRequisitosCompletos = async (
  numRegPer: number,
  idDetalle: string
): Promise<boolean> => {
  // Obtener todos los requisitos obligatorios del evento
  const requisitosObligatorios = await prisma.requisitos_evento.findMany({
    where: {
      id_det: idDetalle,
      obligatorio: true,
    },
  });

  if (requisitosObligatorios.length === 0) {
    return true; // No hay requisitos obligatorios
  }

  // Obtener los requisitos completados por el estudiante
  const requisitosCompletados = await prisma.requisitos_persona.findMany({
    where: {
      num_reg_per: numRegPer,
      id_req: {
        in: requisitosObligatorios.map((r: any) => r.id_req),
      },
      val_req: {
        not: null,
      },
    },
  });

  // Todos los requisitos obligatorios deben estar completados
  return requisitosCompletados.length === requisitosObligatorios.length;
};

/**
 * Obtener requisitos completados por un estudiante
 */
export const obtenerRequisitosCompletados = async (numRegPer: number) => {
  return await prisma.requisitos_persona.findMany({
    where: {
      num_reg_per: numRegPer,
    },
    include: {
      requisitos_evento: true,
    },
  });
};

/**
 * Eliminar un requisito
 */
export const eliminarRequisito = async (idRequisito: number) => {
  return await prisma.requisitos_evento.delete({
    where: {
      id_req: idRequisito,
    },
  });
};
