"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Loader from "../components/animations/Loader";

export default function HomeRedirect() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500); // duración del loader
    return () => clearTimeout(timer);
  }, []);

  // Mientras carga, muestra la animación
  if (isLoading) return <Loader />;

  // Cuando termina, redirige al home
  redirect("/home");

  // (Next.js requiere retornar algo, aunque no se renderiza)
  return null;
}
