// components/perfil/Certificados.tsx
'use client';

import { useEffect, useState } from 'react';
import { certificadosAPI } from '@/services/api';

interface Certificado {
  id: number;
  nombre: string;
  url: string; // link al certificado
  fecha?: string;
}

interface Props {
  usuarioId: number;
}

export default function Certificados({ usuarioId }: Props) {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificados() {
      try {
        const res = await certificadosAPI.listar(usuarioId);
        setCertificados(res.data || []);
      } catch (err) {
        console.error('Error cargando certificados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificados();
  }, [usuarioId]);

  if (loading) return <p>Cargando certificados...</p>;
  if (certificados.length === 0) return <p>No hay certificados disponibles.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {certificados.map((cert) => (
        <a
          key={cert.id}
          href={cert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border p-4 rounded hover:shadow-md transition"
        >
          <p className="font-semibold">{cert.nombre}</p>
          {cert.fecha && <p className="text-sm text-gray-500">{cert.fecha}</p>}
        </a>
      ))}
    </div>
  );
}
