"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./convocatorias.module.css";
import useInView from "../_hooks/useInView";

type FormState = {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
};

export default function ConvocatoriasPage() {
  const [form, setForm] = useState<FormState>({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Banner reveal (aparece suave) + animación
  const bn = useInView();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate(values: FormState) {
    const errs: Partial<FormState> = {};

    if (!values.nombre.trim()) errs.nombre = "Este campo es obligatorio.";

    if (!values.email.trim()) errs.email = "Este campo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      errs.email = "Correo no válido.";

    const tel = values.telefono.replace(/\s/g, "");
    if (!tel) errs.telefono = "Este campo es obligatorio.";
    else if (!/^0?9\d{8}$/.test(tel))
      errs.telefono = "Teléfono no válido. Ej: 09XXXXXXXX";

    if (!values.mensaje.trim()) errs.mensaje = "Cuéntanos tu mensaje.";

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        icon: "success",
        title: "¡Enviado!",
        text: "Hemos recibido tu solicitud. Te contactaremos pronto.",
        confirmButtonColor: "#991B1B",
      });
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
      setErrors({});
    } catch {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal al enviar. Inténtalo de nuevo.",
        confirmButtonColor: "#991B1B",
      });
    }
  }

  return (
    <main className={styles.main}>
      {/* 🔹 Banner superior centrado + animado */}
      <div className={styles.bannerWrap}>
        <section
          ref={bn.ref}
          className={`${styles.banner} ${styles.reveal} ${bn.inView ? styles.show : ""}`}
        >
          <Image
            src="/home/convocatorias.jpg" // coloca tu imagen en /public/home/
            alt="Convocatorias"
            fill
            priority
            className={styles.kenburns}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div className={styles.overlay} />
          <h1 className={styles.bannerTitle}></h1>
        </section>
      </div>

      {/* 🔹 Formulario de contacto */}
      <section className={styles.formSection}>
        <h2 className={styles.title}>Contáctanos</h2>

        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <label className={styles.label} htmlFor="nombre">
            Nombre Completo
          </label>
          <input
            id="nombre"
            name="nombre"
            className={`${styles.input} ${errors.nombre ? styles.inputError : ""}`}
            placeholder="Nombre Apellido"
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre}</span>}

          {/* Email */}
          <label className={styles.label} htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="correo@dominio.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}

          {/* Teléfono */}
          <label className={styles.label} htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            inputMode="numeric"
            className={`${styles.input} ${errors.telefono ? styles.inputError : ""}`}
            placeholder="09XXXXXXXX"
            value={form.telefono}
            onChange={handleChange}
          />
          {errors.telefono && <span className={styles.error}>{errors.telefono}</span>}

          {/* Mensaje */}
          <label className={styles.label} htmlFor="mensaje">
            Mensaje o sugerencia
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={6}
            className={`${styles.textarea} ${errors.mensaje ? styles.inputError : ""}`}
            placeholder=""
            value={form.mensaje}
            onChange={handleChange}
          />
          {errors.mensaje && <span className={styles.error}>{errors.mensaje}</span>}

          <button type="submit" className={styles.submit}>
            ENVIAR
          </button>
        </form>
      </section>
    </main>
  );
}
