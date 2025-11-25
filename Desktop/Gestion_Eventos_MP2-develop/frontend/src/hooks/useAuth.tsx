/**
 * Hook para manejar autenticación y estado del usuario
 */

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { Usuario, LoginResponse } from '@/types/api.types';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token y usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await authAPI.login(email, password);
      
      console.log("=== RESPUESTA DEL LOGIN ===");
      console.log("Response completa:", response);
      console.log("Response.data:", response.data);
      console.log("Response.success:", response.success);
      
      // El backend devuelve { success: true, data: { token, usuario } }
      let token = null;
      let usuario = null;
      
      // Intentar múltiples formas de extraer los datos
      if (response.data) {
        token = response.data.token;
        usuario = response.data.usuario;
      } else if (response.token) {
        token = response.token;
        usuario = response.usuario;
      }
      
      console.log("=== DATOS EXTRAÍDOS ===");
      console.log("Token extraído:", token);
      console.log("Token válido:", !!token);
      console.log("Usuario extraído:", usuario);
      console.log("Usuario válido:", !!usuario);
      
      if (!token) {
        console.error("ERROR: No se encontró el token en la respuesta");
        console.log("Estructura de response:", JSON.stringify(response, null, 2));
      }
      
      if (!usuario) {
        console.error("ERROR: No se encontró el usuario en la respuesta");
      }
      
      if (!token || !usuario) {
        throw new Error('Respuesta de login inválida: falta token o usuario');
      }
      
      setToken(token);
      setUser(usuario);
      
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      console.log("=== DATOS GUARDADOS EN LOCALSTORAGE ===");
      console.log("Token guardado:", localStorage.getItem('token'));
      console.log("Usuario guardado:", !!localStorage.getItem('user'));
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      // Después del registro, hacer login automático
      if (userData.cor_usu && userData.con_usu) {
        await login(userData.cor_usu, userData.con_usu);
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
