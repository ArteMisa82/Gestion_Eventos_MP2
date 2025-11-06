export interface RegisterDto {
  cor_usu: string;      // Correo (obligatorio)
  pas_usu: string;      // Password (obligatorio)
  nom_usu: string;      // Nombre (obligatorio)
  ape_usu: string;      // Apellido (obligatorio)
  nom_seg_usu?: string; // Segundo nombre (opcional)
  ape_seg_usu?: string; // Segundo apellido (opcional)
  tel_usu?: string;     // Teléfono (opcional)
  ced_usu?: string;     // Cédula (opcional)
  niv_usu?: string;     // Nivel (opcional)
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
    };
  };
}
