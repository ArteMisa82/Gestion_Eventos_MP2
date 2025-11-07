"use client";
import { useState, useEffect } from "react";
import Loader from "../components/animations/Loader";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Bienvenido a mi página</h1>
      {/* contenido normal */}
    </main>
  );
}