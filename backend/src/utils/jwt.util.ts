import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';

export interface JwtPayload {
  id_usu: number;
  cor_usu: string;
  adm_usu: number | null;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(
    { id_usu: payload.id_usu, cor_usu: payload.cor_usu, adm_usu: payload.adm_usu },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
