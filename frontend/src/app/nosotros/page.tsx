import Image from "next/image";
import styles from "./nosotros.module.css";

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
    img: "/nosotros/mayorga.jpg",
  },
  {
    name: "Ing. Luis Morales, Mg.",
    role: "SUBDECANO",
    unit: "FISEI",
    img: "/nosotros/morales.jpg",
  },
];

export default function NosotrosPage() {
  return (
    <main className={styles.main}>
      {/* BANNER */}
      <section className={styles.banner}>
        <Image
          src="/nosotros/banner.jpg"
          alt="Banner UTA"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.bannerShade} />
      </section>

      {/* MISIÓN / VISIÓN */}
      <section className={styles.mv}>
        <article className={styles.mvCard}>
          <h3>Misión</h3>
          <p>
            Formar profesionales competentes que impulsen la investigación y la
            innovación con compromiso social, aportando al desarrollo de la
            región y del país.
          </p>
        </article>

        <article className={styles.mvCard}>
          <h3>Visión</h3>
          <p>
            Ser una facultad referente por su excelencia académica, vinculación
            con la sociedad y producción científica de impacto.
          </p>
        </article>
      </section>

      {/* AUTORIDADES */}
      <section className={styles.autoridades}>
        <span className={styles.badge}>Autoridades</span>

        <div className={styles.titleWrap}>
          <span className={styles.mini}>F I S E I</span>
          <h2 className={styles.title}>
            Facultad de Ingeniería en Sistemas, Electrónica e Industrial
          </h2>
        </div>

        <div className={styles.authGrid}>
          {authorities.map((a) => (
            <article key={a.name} className={styles.authCard}>
              <div className={styles.photoBox}>
                <Image
                  src={a.img}
                  alt={a.name}
                  width={340}
                  height={420}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
