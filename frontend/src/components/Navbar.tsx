"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

const links = [
  { href: "/home", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/cursos", label: "Cursos" },
  { href: "/convocatorias", label: "Convocatorias" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Marca institucional */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/home/uta-seal.jpg"     // coloca aquí tu sello real en /public
            alt="Escudo UTA"
            width={190}
            height={40}
            priority
          />
          <span className={styles.brandText}></span>
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
          <Link href="/login" className={styles.secondaryBtn}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className={styles.primaryBtn}>
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
  );
}

