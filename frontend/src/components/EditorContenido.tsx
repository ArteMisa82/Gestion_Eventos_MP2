"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ImageUploader from "./ImageUploader";
import { Save, Search } from "lucide-react";

type Section = "inicio" | "nosotros" | "cursos" | "contacto";

interface ContentData {
  inicio: {
    heroImg: string;
    stats: { value: string; label: string }[];
  };
  nosotros: {
    bannerImg: string;
    mision: string;
    vision: string;
    autoridades: { name: string; role: string; unit: string; img: string }[];
  };
  cursos: {
    coverDefault: string;
    descripcion: string;
  };
  contacto: {
    bannerImg: string;
    title: string;
    email: string;
  };
}

export default function ContentEditor() {
  const [section, setSection] = useState<Section>("inicio");
  const [busqueda, setBusqueda] = useState("");

  const [data, setData] = useState<ContentData>({
    inicio: {
      heroImg: "/home/hero3.jpg",
      stats: [
        { value: "5,000+", label: "Estudiantes activos" },
        { value: "120+", label: "Eventos realizados" },
        { value: "85%", label: "Nivel de satisfacción" },
        { value: "40+", label: "Conferencistas invitados" },
      ],
    },
    nosotros: {
      bannerImg: "/home/uta_fisei2.jpg",
      mision:
        "Formar profesionales competentes que impulsen la investigación y la innovación con compromiso social.",
      vision:
        "Ser una facultad referente por su excelencia académica, vinculación con la sociedad y producción científica.",
      autoridades: [
        {
          name: "Ing. Franklin Mayorga, Mg.",
          role: "Decano",
          unit: "FISEI",
          img: "/home/franklin_mayorga.jpg",
        },
        {
          name: "Ing. Luis Morales, Mg.",
          role: "Subdecano",
          unit: "FISEI",
          img: "/home/luis_morales.jpg",
        },
      ],
    },
    cursos: {
      coverDefault: "/Default_Image.png",
      descripcion:
        "Explora los cursos de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial: programas diseñados para potenciar tu desarrollo profesional.",
    },
    contacto: {
      bannerImg: "/home/convocatorias.jpg",
      title: "Contáctanos",
      email: "contacto@uta.edu.ec",
    },
  });

  // Cargar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("site-content");
    if (saved) setData(JSON.parse(saved));
  }, []);

  // Guardar cambios
  function handleSave() {
    localStorage.setItem("site-content", JSON.stringify(data));
    Swal.fire({
      icon: "success",
      title: "Cambios guardados",
      text: "El contenido fue actualizado correctamente.",
      confirmButtonColor: "#581517",
    });
  }

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Título principal */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center">
        Gestión de Contenido del Sitio
      </h1>

      {/* Buscador */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar en contenido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] text-sm text-gray-700 placeholder-gray-400"
          />
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {(["inicio", "nosotros", "cursos", "contacto"] as Section[]).map(
          (sec) => (
            <button
              key={sec}
              onClick={() => setSection(sec)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all border ${
                section === sec
                  ? "bg-[#581517] text-white border-[#581517]"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {sec === "inicio" && "Inicio"}
              {sec === "nosotros" && "Nosotros"}
              {sec === "cursos" && "Cursos"}
              {sec === "contacto" && "Contacto"}
            </button>
          )
        )}
      </div>

      {/* Panel de contenido */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
        {/* === INICIO === */}
        {section === "inicio" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Sección Inicio</h2>
            
            <ImageUploader
              label="Imagen principal del portal (Hero)"
              value={data.inicio.heroImg}
              onChange={(url) =>
                setData((d) => ({ ...d, inicio: { ...d.inicio, heroImg: url } }))
              }
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Estadísticas del portal
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Edita los valores de las estadísticas que se muestran en el portal principal.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.inicio.stats.map((st, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estadística {i + 1}
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Etiqueta (ej: Estudiantes activos)"
                        value={st.label}
                        onChange={(e) => {
                          const label = e.target.value;
                          setData((d) => {
                            const stats = [...d.inicio.stats];
                            stats[i].label = label;
                            return { ...d, inicio: { ...d.inicio, stats } };
                          });
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                      />
                      <input
                        type="text"
                        placeholder="Valor (ej: 5,000+)"
                        value={st.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          setData((d) => {
                            const stats = [...d.inicio.stats];
                            stats[i].value = value;
                            return { ...d, inicio: { ...d.inicio, stats } };
                          });
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === NOSOTROS === */}
        {section === "nosotros" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Sección Nosotros</h2>

            <ImageUploader
              label="Imagen del banner"
              value={data.nosotros.bannerImg}
              onChange={(url) =>
                setData((d) => ({
                  ...d,
                  nosotros: { ...d.nosotros, bannerImg: url },
                }))
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="font-semibold block mb-3">Misión:</label>
                <textarea
                  value={data.nosotros.mision}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      nosotros: { ...d.nosotros, mision: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517] resize-none"
                  rows={5}
                  placeholder="Ingrese la misión de la facultad..."
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="font-semibold block mb-3">Visión:</label>
                <textarea
                  value={data.nosotros.vision}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      nosotros: { ...d.nosotros, vision: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517] resize-none"
                  rows={5}
                  placeholder="Ingrese la visión de la facultad..."
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Autoridades</h3>
              <div className="space-y-4">
                {data.nosotros.autoridades.map((a, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                        value={a.name}
                        placeholder="Nombre completo"
                        onChange={(e) => {
                          const name = e.target.value;
                          setData((d) => {
                            const autoridades = [...d.nosotros.autoridades];
                            autoridades[i].name = name;
                            return {
                              ...d,
                              nosotros: { ...d.nosotros, autoridades },
                            };
                          });
                        }}
                      />
                      <input
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                        value={a.role}
                        placeholder="Cargo"
                        onChange={(e) => {
                          const role = e.target.value;
                          setData((d) => {
                            const autoridades = [...d.nosotros.autoridades];
                            autoridades[i].role = role;
                            return {
                              ...d,
                              nosotros: { ...d.nosotros, autoridades },
                            };
                          });
                        }}
                      />
                    </div>
                    <ImageUploader
                      label="Foto de la autoridad"
                      value={a.img}
                      onChange={(url) => {
                        setData((d) => {
                          const autoridades = [...d.nosotros.autoridades];
                          autoridades[i].img = url;
                          return {
                            ...d,
                            nosotros: { ...d.nosotros, autoridades },
                          };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === CURSOS === */}
        {section === "cursos" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Sección Cursos</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="font-semibold block mb-3">Descripción de cursos:</label>
              <textarea
                value={data.cursos.descripcion}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    cursos: { ...d.cursos, descripcion: e.target.value },
                  }))
                }
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517] resize-none"
                rows={4}
                placeholder="Ingrese la descripción general de los cursos..."
              />
            </div>

            <ImageUploader
              label="Imagen por defecto de los cursos"
              value={data.cursos.coverDefault}
              onChange={(url) =>
                setData((d) => ({
                  ...d,
                  cursos: { ...d.cursos, coverDefault: url },
                }))
              }
            />
          </div>
        )}

        {/* === CONTACTO === */}
        {section === "contacto" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Sección Contacto</h2>

            <ImageUploader
              label="Banner de la sección contacto"
              value={data.contacto.bannerImg}
              onChange={(url) =>
                setData((d) => ({
                  ...d,
                  contacto: { ...d.contacto, bannerImg: url },
                }))
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="font-semibold block mb-3">
                  Título del formulario:
                </label>
                <input
                  type="text"
                  value={data.contacto.title}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      contacto: { ...d.contacto, title: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                  placeholder="Ingrese el título del formulario..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="font-semibold block mb-3">
                  Correo de destino:
                </label>
                <input
                  type="email"
                  value={data.contacto.email}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      contacto: { ...d.contacto, email: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
                  placeholder="Ingrese el correo electrónico..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#581517] text-white rounded-md font-medium hover:bg-[#6e1b1b] transition-all shadow-md"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}