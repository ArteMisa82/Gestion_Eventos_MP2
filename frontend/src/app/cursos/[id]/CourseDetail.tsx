"use client";
import Image from "next/image";
import styles from "../cursos.module.css";

interface CourseDetailProps {
  title: string;
  image: string;
  info: {
    inscriptionDates: string;
    quota: string;
    location: string;
    courseDates: string;
    schedule: string;
    prices: string[];
    certification: string;
    duration: string;
    beneficiaries: string;
    modality: string;
    prerequisites: string;
  };
}

export default function CourseDetail({ title, image, info }: CourseDetailProps) {
  return (
    <div className={styles.detailMain}>
      <h1 className={styles.detailTitle}>{title}</h1>

      <div className={styles.detailLayout}>
        {/* Tabs / Secciones */}
        <div className={styles.detailTabs}>
          <div className={`${styles.tab} ${styles.active}`}>Información del curso</div>
          <div className={styles.tab}>Requisitos y Detalles</div>
          <div className={styles.tab}>Materiales y Equipos</div>
          <div className={styles.tab}>Contenidos</div>
        </div>

        <div className={styles.detailContent}>
          <div className={styles.detailInfo}>
            <p><strong>Fechas de inscripciones:</strong> {info.inscriptionDates}</p>
            <p><strong>El cupo de inscripciones:</strong> {info.quota}</p>
            <p><strong>Lugar del evento:</strong> {info.location}</p>
            <p><strong>Fecha del curso:</strong> {info.courseDates}</p>
            <p><strong>Horario:</strong> {info.schedule}</p>
            <p><strong>Precio para los asistentes:</strong></p>
            <ul>
              {info.prices.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <p><strong>Tipo de capacitación:</strong> {info.certification}</p>
            <p><strong>Horas de capacitación:</strong> {info.duration}</p>
            <p><strong>Beneficiarios:</strong> {info.beneficiaries}</p>
            <p><strong>Modalidad:</strong> {info.modality}</p>
            <p><strong>Conocimientos previos:</strong> {info.prerequisites}</p>
          </div>

          <div className={styles.detailImage}>
            <Image
              src={image}
              alt={title}
              width={400}
              height={260}
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          </div>
        </div>

        <button className={styles.detailButton}>REGISTRARME EN ESTE CURSO</button>
      </div>
    </div>
  );
}
