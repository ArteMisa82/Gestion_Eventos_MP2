export interface IUser {
  id_usu?: number;
  cor_usu: string;
  pas_usu: string;
  ced_usu?: string | null;
  nom_usu: string;
  nom_seg_usu?: string | null;
  ape_usu: string;
  ape_seg_usu?: string | null;
  tel_usu?: string | null;
  img_usu?: string | null;
  pdf_ced_usu?: string | null;
  stu_usu?: number | null;   // 👈 antes era solo number
  niv_usu?: string | null;
  adm_usu?: number | null;   // 👈 puede ser null
  Administrador?: boolean;
}
