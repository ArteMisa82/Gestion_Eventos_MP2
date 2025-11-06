import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>UTA · Gestión de Eventos</div>
        <div className={styles.socials}>
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="Google">Google</a>
          <a href="#" aria-label="LinkedIn">LinkedIn</a>
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          <h4>Useful Links</h4>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Eventos</a></li>
            <li><a href="#">Certificados</a></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li><a href="#">Preguntas frecuentes</a></li>
            <li><a href="#">Ayuda</a></li>
            <li><a href="#">Soporte técnico</a></li>
          </ul>
        </div>

        <div>
          <h4>Contact Us</h4>
          <ul>
            <li>Av. Universidad, Ambato</li>
            <li>soporte@uta.edu.ec</li>
            <li>+593 99 999 9999</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} Universidad Técnica de Ambato — Todos los derechos reservados.
      </div>
    </footer>
  );
}
