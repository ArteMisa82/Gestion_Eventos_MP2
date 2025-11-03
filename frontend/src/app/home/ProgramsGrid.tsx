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
    title: "Doctor of Physical Therapy (DPT)",
    desc: "Conoce los programas de formación más destacados de nuestra universidad.",
    href: "/cursos/dpt",
    img: "/home/IA.jpg",
  },
  {
    title: "PhD Engineering Dual Degree",
    desc: "Conoce los programas de formación más destacados de nuestra universidad.",
    href: "/cursos/phd-engineering",
    img: "/home/datos.jpg",
  },
  {
    title: "Master of Public Health (MPH)",
    desc: "Conoce los programas de formación más destacados de nuestra universidad.",
    href: "/cursos/mph",
    img: "/home/ciberse.jpg",
  },
];

export default function ProgramsGrid({ programs = defaultPrograms }: Props) {
  return (
    <section className={styles.programs}>
      <div className={styles.header}>
        <span className={styles.badge}>Cursos</span>
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
              Ver detalle
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

