// DTOs para eventos
export interface CreateEventoDto {
  nom_evt: string;
  fec_evt: string | Date;
  lug_evt: string;
  des_evt: string;
  id_usu_res?: number; // Responsable asignado (opcional en creación)
}

export interface UpdateEventoDto {
  nom_evt?: string;
  fec_evt?: string | Date;
  lug_evt?: string;
  tip_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  des_evt?: string;
  id_usu_res?: number;
}

export interface AsignarResponsableDto {
  id_usu_res: number;
}

// Respuesta de evento con información del responsable
export interface EventoResponse {
  id_evt: string;
  nom_evt: string;
  fec_evt: Date;
  lug_evt: string;
  tip_evt: string | null;
  mod_evt: string | null;
  tip_pub_evt: string | null;
  cos_evt: string | null;
  des_evt: string;
  id_usu_res: number | null;
  responsable?: {
    id_usu: number;
    nom_usu: string;
    ape_usu: string;
    cor_usu: string;
  };
}

// Usuario administrativo (para listar responsables)
export interface UsuarioAdministrativoDto {
  id_usu: number;
  nom_usu: string;
  ape_usu: string;
  cor_usu: string;
}
