"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./navbar.module.css";
import LoginModal from "../components/loginModal"; //importa el modal

const links = [
  { href: "/home", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/cursos", label: "Cursos" },
  { href: "/convocatorias", label: "Convocatorias" },
];

export default function Navbar() {
  const pathname = usePathname();

  // 👇 Estado para controlar el modal
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
        </ul>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            onClick={() => setIsLoginOpen(true)} // 👈 abre el modal de login
            className={styles.secondaryBtn}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => {
              setIsLoginOpen(true);
              setIsRegisterOpen(true); // 👈 abre modal directamente en registro
            }}
            className={styles.primaryBtn}
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* MODAL de Login / Registro */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(false);
        }}
        // 👇 le pasamos prop opcional para abrir en modo registro
        initialRegister={isRegisterOpen}
      />
    </header>
  );
}
