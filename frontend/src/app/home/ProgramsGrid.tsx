import Image from "next/image";
import styles from "./home.module.css";

type Program = {
  title: string;
  desc?: string;
  href?: string;
  img?: string;
};

type Props = {
  programs?: Program[];
};

const defaultPrograms: Program[] = [
  {
    title: "Telecomunicaciones y Redes",
    desc: "Aprenderás a diseñar, implementar y gestionar redes de datos (LAN, WAN, Internet) y sistemas de comunicación modernos, garantizando la conectividad, seguridad y rendimiento de la infraestructura digital.",
    href: "/cursos/dpt",
    img: "/home/IA.jpg",
  },
  {
    title: "Software y Desarrollo de Aplicaciones",
    desc: "Te prepararás para crear soluciones en diferentes plataformas: web, móvil y de escritorio.",
    href: "/cursos/phd-engineering",
    img: "/home/datos.jpg",
  },
  {
    title: "Robotica y Automatización",
    desc: "Aprenderás a programar el movimiento, la percepción y la toma de decisiones de máquinas para automatizar procesos industriales y mejorar la eficiencia en diversos entornos.",
    href: "/cursos/mph",
    img: "/home/ciberse.jpg",
  },
  
];

export default function ProgramsGrid({ programs = defaultPrograms }: Props) {
  return (
    <section className={styles.programs}>
      <div className={styles.header}>
        <span className={styles.badge}></span>
        <h2>Nuestros Programas</h2>
        <a href="/cursos" className={styles.link}>
          Ver más →
        </a>
      </div>

      <div className={styles.cards}>
        {programs.map((p) => (
          <article key={p.title} className={styles.card}>
            <div className={styles.cardImage}>
              {p.img ? (
                <Image
                  src={p.img}
                  alt={p.title}
                  width={480}
                  height={280}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                  priority
                />
              ) : (
                <Image src="/file.svg" alt="" width={48} height={48} />
              )}
            </div>

            <h3>{p.title}</h3>
            <p>{p.desc ?? "Conoce los programas de formación más destacados de nuestra universidad."}</p>
            <a className={styles.cardLink} href={p.href ?? "#"}>
              
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

