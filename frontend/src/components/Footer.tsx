import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>UTA · Gestión de Eventos</div>
        <div className={styles.socials}>
          <a href="https://www.facebook.com/UniversidadTecnicadeAmbatoOficial/?locale=es_LA" aria-label="Facebook">Facebook</a>
          <a href="https://www.instagram.com/utecnicaambato/" aria-label="Instagram">Instagram</a>
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          <h4>Enlaces Útiles</h4>
          <ul>
            <li><a href="http://localhost:3000/nosotros">Nosotros</a></li>
            <li><a href="http://localhost:3000/cursos">Eventos</a></li>
          </ul>
        </div>

        <div>
          <h4>Soporte</h4>
          <ul>
            <li><a href="#">Formulario de cambios</a></li>
          </ul>
        </div>

        <div>
          <h4>Contáctanos</h4>
          <ul>
            <li>Avenida los chásquis, y, Ambato</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} Universidad Técnica de Ambato — Todos los derechos reservados.
      </div>
    </footer>
  );
}
