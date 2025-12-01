// src/services/comite.service.ts
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface ComiteMember {
  id_sc_com: number;
  nom_com: string;
  ape_com: string;
  cor_com: string;
}

export class ComiteService {
  async loginComite(cor_com: string, tok_seg: string): Promise<ComiteMember | null> {
    // Buscar miembro del comité por correo
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
}
