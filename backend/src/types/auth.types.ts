export interface RegisterDto {
  cor_usu: string;
  pas_usu: string;
  nom_usu: string;
  ape_usu: string;
  nom_seg_usu?: string;
  ape_seg_usu?: string;
  tel_usu?: string;
  ced_usu?: string;
  niv_usu?: string;
}

export interface LoginDto {
  cor_usu: string;
  pas_usu: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: {
      id_usu: number;
      cor_usu: string;
      nom_usu: string;
      ape_usu: string;
      adm_usu: number | null;
      stu_usu: number | null;
      Administrador: boolean;
    };
  };
}
