/**
 * EJEMPLO PRÁCTICO: Actualización de loginModal.tsx
 * De código mock a integración real con backend
 */

// ==========================================
// VERSIÓN ACTUALIZADA CON BACKEND INTEGRADO
// ==========================================

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecuperarModal from "@/app/login/RecuperarModal";
import RegisterForm from "@/app/login/registroForm";
import logo from "../../public/logo_UTA.png";

// ✅ IMPORTAR SERVICIO DE API
import { authAPI } from '@/services/api';

export default function LoginModal({
  isOpen,
  onClose,
  initialRegister = false,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRegister?: boolean;
  onLoginSuccess?: (userData: any) => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(initialRegister);
  
  // ✅ NUEVO: Estado de carga
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShowRegister(initialRegister);
  }, [isOpen, initialRegister]);

  // ==========================================
  // ✅ LÓGICA DE LOGIN CON BACKEND REAL
  // ==========================================
  const handleLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      Swal.fire({
        title: 'Campos vacíos',
        text: 'Por favor ingresa email y contraseña',
        icon: 'warning',
        confirmButtonColor: '#581517',
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ LLAMADA REAL AL BACKEND
      const response = await authAPI.login(email, password);
      
      // response = { token: "xxx", usuario: {...} }
      const { token, usuario } = response;
      
      // ✅ GUARDAR EN LOCALSTORAGE
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      // ✅ DETERMINAR REDIRECCIÓN SEGÚN ROL
      let mensaje = '';
      let ruta = '/home';
      
      if (usuario.adm_usu === 1 || usuario.Administrador === true) {
        mensaje = `Bienvenido ${usuario.nom_usu} 👑`;
        ruta = '/admin';
      } else if (usuario.stu_usu === 1) {
        mensaje = `Bienvenido ${usuario.nom_usu} 🎓`;
        ruta = '/cursos';
      } else {
        mensaje = `Bienvenido ${usuario.nom_usu}`;
        ruta = '/home';
      }
      
      // ✅ MOSTRAR MENSAJE DE ÉXITO
      await Swal.fire({
        title: mensaje,
        icon: 'success',
        confirmButtonColor: '#581517',
        timer: 2000,
      });
      
      // ✅ LIMPIAR CAMPOS
      setEmail("");
      setPassword("");
      
      // ✅ CALLBACK AL NAVBAR (para actualizar estado)
      if (onLoginSuccess) {
        onLoginSuccess(usuario);
      }
      
      // ✅ CERRAR MODAL Y REDIRIGIR
      onClose();
      router.push(ruta);
      
    } catch (error: any) {
      // ✅ MANEJO DE ERRORES
      Swal.fire({
        title: 'Error de autenticación',
        text: error.message || 'Credenciales incorrectas',
        icon: 'error',
        confirmButtonColor: '#581517',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RESTO DEL COMPONENTE (UI)
  // ==========================================
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="Logo UTA" width={80} height={80} />
            </div>

            {showRegister ? (
              <RegisterForm onBackToLogin={() => setShowRegister(false)} />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center mb-6 text-[#581517]">
                  Iniciar Sesión
                </h2>

                {/* Campo Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@uta.edu.ec"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Botón Login */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#581517] hover:bg-[#6d1a1d] text-white'
                  }`}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                {/* Enlaces */}
                <div className="mt-4 text-center text-sm">
                  <button
                    onClick={() => setIsRecoverOpen(true)}
                    className="text-[#581517] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-[#581517] font-semibold hover:underline"
                  >
                    Regístrate
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Modal Recuperar Contraseña */}
          <RecuperarModal
            isOpen={isRecoverOpen}
            onClose={() => setIsRecoverOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// CAMBIOS PRINCIPALES:
// ==========================================
// 1. ✅ Importar authAPI desde @/services/api
// 2. ✅ Agregar estado isLoading
// 3. ✅ Reemplazar lógica hardcodeada por llamada real
// 4. ✅ Guardar token y usuario en localStorage
// 5. ✅ Determinar ruta según flags del usuario (adm_usu, stu_usu)
// 6. ✅ Manejo de errores con mensajes del backend
// 7. ✅ Loading state en el botón
// 8. ✅ Enter key para submit
