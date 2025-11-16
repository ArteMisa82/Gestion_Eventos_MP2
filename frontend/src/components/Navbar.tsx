"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [user, setUser] = useState<any>(null);

  // 🔄 Cargar usuario desde localStorage al montar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // 🔐 Cuando el login es exitoso
  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoginOpen(false);
  };

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/home");
  };

 return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        
        {/* Marca institucional */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/home/uta-seal.jpg"
            alt="Escudo UTA"
            width={190}
            height={40}
            priority
          />
        </Link>

        {/* Links de navegación */}
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

          {/* 🔸 ADMIN */}
          {user?.role === "admin" && (
            <li>
              <Link
                href="/admin"
                className={
                  pathname === "/admin" ? styles.activeLink : styles.link
                }
              >
                Panel Admin
              </Link>
            </li>
          )}

          {/* 🔹 RESPONSABLE */}
          {user?.isResponsable && (
            <li>
              <Link
                href="/responsable"
                className={
                  pathname === "/responsable" ? styles.activeLink : styles.link
                }
              >
                Panel Responsable
              </Link>
            </li>
          )}

          {/* 🔹 DOCENTE */}
          {user?.isDocente && (
            <li>
              <Link
                href="/cursos/docente"
                className={
                  pathname === "/cursos/docente"
                    ? styles.activeLink
                    : styles.link
                }
              >
                Panel Docente
              </Link>
            </li>
          )}
        </ul>

        {/* Botones + Icono de Home si está logueado */}
        <div className={styles.actions}>
          {user ? (
            <>
              {/* 🏠 ICONO DE CASA */}
              <button
                onClick={() => router.push("/usuarios/cursos")}
                className="mr-4 hover:scale-105 transition"
              >
                <Home size={26} className="text-[#7f1d1d] cursor-pointer" />
              </button>

              <span className={styles.userName}> {user.name}</span>
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

      {/* Modal */}
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
