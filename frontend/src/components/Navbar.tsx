"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Home } from "lucide-react";
import styles from "./navbar.module.css";
import LoginModal from "../components/loginModal";

const links = [
  { href: "/home", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/cursos", label: "Cursos" },
  { href: "/convocatorias", label: "Contáctanos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // auth context
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // ⭐ Roles coherentes con LoginModal
  const isAdmin = user?.Administrador === true;
  // Determinar si el usuario es responsable (tiene eventos asignados)
  const isResponsable = !!(user?.eventos && user.eventos.length > 0);
  const isStudent = user?.stu_usu === 1;

  const handleLoginSuccess = (_userData: any) => {
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/home');
  };

 

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/home/uta-seal.jpg"
            alt="Escudo UTA"
            width={180}
            height={40}
            priority
          />
        </Link>

        {/* Links principales */}
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  pathname === link.href ? styles.activeLink : styles.link
                }
              >
                {link.label}
              </Link>
            </li>
          ))}

            {/* Panel SOLO Admin */}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={
                  pathname === "/admin" ? styles.activeLink : styles.link
                }
              >
                Panel
              </Link>
            </li>
          )}

        </ul>

        {/* Panel de Usuario + Logout */}
        <div className={styles.actions}>
          {user ? (
            <>
            {/* (Responsable/Docente panels removed from main navbar — accessible through user menu) */}
              {/* Icono HOME → Solo si NO es Admin */}
              {!isAdmin && (
                <button
                  onClick={() =>
                    router.push(
                      isResponsable
                        ? "/usuarios/cursos"
                        : isStudent
                        ? "/usuarios/cursos"
                        : "/users/cursos"
                    )
                  }
                  className="mr-4 hover:scale-105 transition"
                >
                  <Home size={26} className="text-[#7f1d1d] cursor-pointer" />
                </button>
              )}

              <span className={styles.userName}>
                👋 {user?.nom_usu || "Usuario"}
              </span>

              <button onClick={handleLogout} className={styles.secondaryBtn}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className={styles.secondaryBtn}
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsRegisterOpen(true);
                }}
                className={styles.primaryBtn}
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(false);
        }}
        initialRegister={isRegisterOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
