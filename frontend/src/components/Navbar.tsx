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
        <div className={styles.brand}>
          <Image src="/vercel.svg" width={28} height={28} alt="Logo" />
          <span>Universidad Técnica de Ambato</span>
        </div>

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
