"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Search, Star, AlertCircle } from "lucide-react";
import EditEventModal from "../EditarEventoModal";
import { favoritesAPI, eventosAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface Evento {
  id_evt: string;
  nom_evt: string;
  fec_evt: string | Date;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  est_evt: string;
  fec_fin_evt?: string | Date | null;
  ima_evt?: string;
  esFavorito?: boolean;
}

export default function EventosCompletosPage() {
  const { token } = useAuth();
  const [filtro, setFiltro] = useState("PUBLICADO");
  const [busqueda, setBusqueda] = useState("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: string; mensaje: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const cargar = async () => {
      try {
        const [resEventos, resFavs] = await Promise.all([
          eventosAPI.getAll(),
          favoritesAPI.getList(),
        ]);

        const evts = (resEventos as any)?.data ?? [];
        const favs = (resFavs as any)?.data ?? [];
        const favIds = new Set(favs.map((f: any) => f.id_evt));

        if (mounted) {
          setEventos(evts.map((e: any) => ({ ...e, esFavorito: favIds.has(e.id_evt) })));
          setLoading(false);
        }
      } catch (err) {
        console.error("Error cargando:", err);
        if (mounted) setLoading(false);
      }
    };

    cargar();
    return () => { mounted = false; };
  }, [token]);

  // Validar si se puede marcar como favorito
  const puedeMarcarse = (evt: Evento): { puede: boolean; razon?: string } => {
    // 1. Validar que esté PUBLICADO
    if (evt.est_evt !== "PUBLICADO") {
      return { puede: false, razon: "Solo se pueden marcar como favoritos eventos PUBLICADOS." };
    }

    // 2. Validar que no haya terminado
    if (evt.fec_fin_evt) {
      const fechaFin = new Date(evt.fec_fin_evt);
      const ahora = new Date();
      if (fechaFin < ahora) {
        return { puede: false, razon: "No se puede marcar como favorito un evento que ya ha finalizado." };
      }
    }

    return { puede: true };
  };

  const toggleFavorito = (evt: Evento) => {
    // Si ya es favorito, permitir desmarcar
    if (evt.esFavorito) {
      setEventos((prev) => {
        const updated = prev.map((e) =>
          e.id_evt === evt.id_evt ? { ...e, esFavorito: false } : e
        );

        favoritesAPI.toggle(evt.id_evt, false).catch((error) => {
          console.error("Error:", error);
          setEventos((prev2) =>
            prev2.map((e) =>
              e.id_evt === evt.id_evt ? { ...e, esFavorito: true } : e
            )
          );
        });

        return updated;
      });
      return;
    }

    // Si no es favorito, validar si se puede marcar
    const validacion = puedeMarcarse(evt);
    if (!validacion.puede) {
      setAlerta({ tipo: "error", mensaje: validacion.razon || "No se puede marcar este evento" });
      setTimeout(() => setAlerta(null), 4000);
      return;
    }

    // Si pasa validaciones, marcar como favorito
    setEventos((prev) => {
      const updated = prev.map((e) =>
        e.id_evt === evt.id_evt ? { ...e, esFavorito: true } : e
      );

      favoritesAPI.toggle(evt.id_evt, true).catch((error) => {
        console.error("Error:", error);
        setEventos((prev2) =>
          prev2.map((e) =>
            e.id_evt === evt.id_evt ? { ...e, esFavorito: false } : e
          )
        );
        setAlerta({ tipo: "error", mensaje: error.message || "Error al marcar favorito" });
        setTimeout(() => setAlerta(null), 4000);
      });

      return updated;
    });
  };

  // Determinar si un evento está finalizado por fecha
  const estaFinalizado = (evt: Evento): boolean => {
    if (!evt.fec_fin_evt) return false;
    const fechaFin = new Date(evt.fec_fin_evt);
    return fechaFin < new Date();
  };

  // Mapear estado a etiqueta
  const mapearEstado = (est: string, estaFin: boolean): string => {
    if (est === "EDITANDO") return "Nuevo";
    if (est === "PUBLICADO" && estaFin) return "Finalizado";
    if (est === "PUBLICADO") return "En Proceso";
    return est;
  };

  const eventosFiltrados = eventos.filter((e) => {
    let cumpleFiltro = false;

    if (filtro === "EDITANDO") {
      cumpleFiltro = e.est_evt === "EDITANDO";
    } else if (filtro === "PUBLICADO") {
      cumpleFiltro = e.est_evt === "PUBLICADO" && !estaFinalizado(e);
    } else if (filtro === "FINALIZADO") {
      cumpleFiltro = estaFinalizado(e);
    }

    return cumpleFiltro && e.nom_evt.toLowerCase().includes(busqueda.toLowerCase());
  });

  const eventosFavoritos = eventos.filter((e) => e.esFavorito);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      <h1 className="text-3xl font-semibold mb-6 text-center">Panel de Administración - Eventos</h1>

      {/* Alerta de validación */}
      {alerta && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${alerta.tipo === "error"
            ? "bg-red-50 border border-red-200 text-red-800"
            : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
          <AlertCircle size={20} className="flex-shrink-0" />
          <p>{alerta.mensaje}</p>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#581517] text-sm"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {["EDITANDO", "PUBLICADO", "FINALIZADO"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all border ${filtro === estado
                ? "bg-[#581517] text-white border-[#581517]"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            {estado === "EDITANDO" ? "Nuevos" : estado === "PUBLICADO" ? "En Proceso" : "Finalizados"}
          </button>
        ))}
      </div>

      {eventosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {eventosFiltrados.map((evt) => {
            const estaFin = estaFinalizado(evt);
            const validacion = puedeMarcarse(evt);
            const estadoLabel = mapearEstado(evt.est_evt, estaFin);

            return (
              <div key={evt.id_evt} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all border border-gray-200">
                <div className="h-36 bg-gray-200 overflow-hidden">
                  {evt.ima_evt && <img src={evt.ima_evt} alt={evt.nom_evt} className="w-full h-full object-cover" />}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold flex-1">{evt.nom_evt}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${estadoLabel === "Nuevo" ? "bg-green-100 text-green-800" :
                        estadoLabel === "En Proceso" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                      }`}>
                      {estadoLabel}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Fecha:</span> {new Date(evt.fec_evt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Lugar:</span> {evt.lug_evt}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Modalidad:</span> {evt.mod_evt}</p>
                  <p className="text-sm text-gray-600 mb-4"><span className="font-medium">Público:</span> {evt.tip_pub_evt}</p>
                  <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Estado:</span> {estadoLabel} {evt.est_evt ? <span className="text-xs text-gray-400 ml-2">({evt.est_evt})</span> : null}
                  </p>

                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => toggleFavorito(evt)}
                      disabled={!evt.esFavorito && !validacion.puede}
                      className={`flex items-center gap-1 text-sm font-medium transition ${!evt.esFavorito && !validacion.puede
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "hover:text-yellow-600"
                        }`}
                      title={!evt.esFavorito && !validacion.puede ? validacion.razon : ""}
                    >
                      <Star size={16} className={evt.esFavorito ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
                      <span className={evt.esFavorito ? "text-yellow-500" : "text-gray-600"}>
                        {evt.esFavorito ? "Quitar" : "Añadir"}
                      </span>
                    </button>
                    <button
                      onClick={() => setEventoEditando(evt)}
                      className="flex items-center gap-2 text-[#581517] text-sm font-medium hover:text-[#7a1c1c] transition"
                    >
                      <Pencil size={16} /> Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-10">No hay eventos en esta categoría.</p>
      )}

      <div className="mt-10 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-center">⭐ Eventos Marcados como Favoritos</h2>
        {eventosFavoritos.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {eventosFavoritos.map((evt) => (
              <div key={evt.id_evt} className="min-w-[280px] bg-white border-2 border-yellow-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-32 bg-gray-200 overflow-hidden">
                  {evt.ima_evt && <img src={evt.ima_evt} alt={evt.nom_evt} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 flex-1">{evt.nom_evt}</h3>
                    <Star size={16} className="text-yellow-400 fill-yellow-400 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1"><span className="font-medium">Fecha:</span> {new Date(evt.fec_evt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mb-3"><span className="font-medium">Lugar:</span> {evt.lug_evt}</p>
                  <button
                    onClick={() => toggleFavorito(evt)}
                    className="text-xs text-[#581517] font-medium hover:text-[#7a1c1c] transition"
                  >
                    Quitar de favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-8">Aún no hay eventos marcados como favoritos.</p>
        )}
      </div>

      {eventoEditando && (
        <EditEventModal
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onSave={() => setEventoEditando(null)}
        />
      )}
    </div>
  );
}
