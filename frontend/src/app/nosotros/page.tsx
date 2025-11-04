"use client";
import Image from "next/image";
import styles from "./nosotros.module.css";
import useInView from "../_hooks/useInView";

type Authority = {
  name: string;
  role: string;
  unit: string;
  img: string;
};

const authorities: Authority[] = [
  {
    name: "Ing. Franklin Mayorga, Mg.",
    role: "DECANO",
    unit: "FISEI",
    img: "/home/franklin_mayorga.jpg",
  },
  {
    name: "Ing. Luis Morales, Mg.",
    role: "SUBDECANO",
    unit: "FISEI",
    img: "/home/luis_morales.jpg",
  },
];

export default function NosotrosPage() {
  // hooks para revelar secciones
  const bn = useInView();   // banner
  const mv1 = useInView();  // misión
  const mv2 = useInView();  // visión
  const auSec = useInView(); // bloque autoridades

  return (
    <main className={styles.main}>
      {/* BANNER */}
      <section
        ref={bn.ref as any}
        className={`${styles.banner} ${styles.reveal} ${styles.fadeUp} ${bn.inView ? styles.in : ""}`}
      >
        <Image
          src="/home/uta_fisei2.jpg"
          alt="Banner UTA"
          width={1200}
          height={280}
          className={styles.kenburns}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          priority
        />
        <div className={styles.bannerShade} />
      </section>

      {/* MISIÓN / VISIÓN */}
      <section className={styles.mv}>
        <article
          ref={mv1.ref as any}
          className={`${styles.mvCard} ${styles.reveal} ${styles.fadeUp} ${mv1.inView ? styles.in : ""}`}
          style={{ transitionDelay: "80ms" }}
        >
          <h3>Misión</h3>
          <p>
            Formar profesionales competentes que impulsen la investigación y la
            innovación con compromiso social, aportando al desarrollo de la
            región y del país.
          </p>
        </article>

        <article
          ref={mv2.ref as any}
          className={`${styles.mvCard} ${styles.reveal} ${styles.fadeUp} ${mv2.inView ? styles.in : ""}`}
          style={{ transitionDelay: "180ms" }}
        >
          <h3>Visión</h3>
          <p>
            Ser una facultad referente por su excelencia académica, vinculación
            con la sociedad y producción científica de impacto.
          </p>
        </article>
      </section>

      {/* AUTORIDADES */}
      <section
        ref={auSec.ref as any}
        className={`${styles.autoridades} ${styles.reveal} ${styles.fadeUp} ${auSec.inView ? styles.in : ""}`}
      >
        <span className={styles.badge}>Autoridades</span>

        <div className={styles.titleWrap}>
          <span className={styles.mini}>F I S E I</span>
          <h2 className={styles.title}>
            Facultad de Ingeniería en Sistemas, Electrónica e Industrial
          </h2>
        </div>

        <div className={styles.authGrid}>
          {authorities.map((a, i) => (
            <article
              key={a.name}
              className={`${styles.authCard} ${styles.reveal} ${styles.fadeUp} ${auSec.inView ? styles.in : ""}`}
              style={{ transitionDelay: `${120 + i * 140}ms` }}
            >
              <div className={styles.photoBox}>
                <Image
                  src={a.img}
                  alt={a.name}
                  width={340}
                  height={420}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className={styles.authInfo}>
                <strong className={styles.authName}>{a.name}</strong>
                <span className={styles.authRole}>{a.role}</span>
                <span className={styles.authUnit}>{a.unit}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

