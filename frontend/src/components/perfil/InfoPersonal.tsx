'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Swal from 'sweetalert2';

interface InfoPersonalProps {
  setMostrarModal: (value: boolean) => void;
}

interface Nivel {
  id_niv: string;
  nom_niv: string;
  org_cur_niv: string;
  carrera: {
    id_car: string;
    nom_car: string;
  };
  carreras?: {
    id_car: string;
    nom_car: string;
  };
  estudiantes_activos: number;
  cursos_disponibles: number;
}

interface FormData {
  nom_usu: string;
  nom_seg_usu: string;
  ape_usu: string;
  ape_seg_usu: string;
  ced_usu: string;
  tel_usu: string;
  niv_usu: string;
  cor_usu: string;
}

export default function InfoPersonal({ setMostrarModal }: InfoPersonalProps) {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nom_usu: '',
    nom_seg_usu: '',
    ape_usu: '',
    ape_seg_usu: '',
    ced_usu: '',
    tel_usu: '',
    niv_usu: '',
    cor_usu: ''
  });
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      const userData = user as any;
      // Obtener el nivel del estudiante activo
      const nivelActual = userData.estudiantes && userData.estudiantes.length > 0 
        ? userData.estudiantes[0].id_niv 
        : (userData.niv_usu || '');
      
      setFormData({
        nom_usu: user.nom_usu || '',
        nom_seg_usu: userData.nom_seg_usu || '',
        ape_usu: user.ape_usu || '',
        ape_seg_usu: userData.ape_seg_usu || '',
        ced_usu: userData.ced_usu || '',
        tel_usu: userData.tel_usu || '',
        niv_usu: nivelActual,
        cor_usu: user.cor_usu || ''
      });
    }
  }, [user]);
  // ✅ Detectar si es estudiante
const esEstudiante = Number((user as any)?.stu_usu) === 1;

// ✅ Obtener solo las carreras activas del estudiante
const carrerasDelEstudiante = ((user as any)?.estudiantes || [])
  .map((e: any) => ({
    id_niv: e.nivel.id_niv,
    nombre: `${e.nivel.carreras.nom_car} - ${e.nivel.nom_niv}`
  }));

// Opciones de nivel: preferir catálogo completo, si no hay usar las del estudiante
const opcionesNivel = niveles.length > 0
  ? niveles.map((n: any) => ({
      id_niv: n.id_niv,
      nombre: `${n.carreras?.nom_car || n.carrera?.nom_car || 'Carrera'} - ${n.nom_niv}`
    }))
  : carrerasDelEstudiante;


  // Cargar niveles desde el backend
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/niveles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          setNiveles(result.data);
        }
      } catch (error) {
        console.error('Error al cargar niveles:', error);
      }
    };

    if (token && esEstudiante) {
      fetchNiveles();
    }
  }, [token, esEstudiante]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nom_usu || !formData.ape_usu || !formData.ced_usu) {
      await Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: 'Por favor complete nombre, apellido y cédula',
        confirmButtonColor: '#7A1C1C'
      });
      return;
    }

    if (formData.ced_usu.length !== 10) {
      await Swal.fire({
        icon: 'error',
        title: 'Cédula inválida',
        text: 'La cédula debe tener 10 dígitos',
        confirmButtonColor: '#7A1C1C'
      });
      return;
    }

    const esEstudiante = (user as any)?.stu_usu === 1;

    if (esEstudiante && !formData.niv_usu) {
      await Swal.fire({
        icon: 'error',
        title: 'Nivel requerido',
        text: 'Selecciona tu nivel / semestre para completar el perfil de estudiante',
        confirmButtonColor: '#7A1C1C'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/api/user/${user?.id_usu}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Perfil actualizado!',
          text: 'Tus datos se han guardado correctamente',
          confirmButtonColor: '#7A1C1C'
        });

        // Actualizar localStorage
        const updatedUser = { ...user, ...result.data, niv_usu: formData.niv_usu };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      } else {
        throw new Error(result.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil',
        confirmButtonColor: '#7A1C1C'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-[#7A1C1C]">
        Información Personal
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <input
          name="nom_usu"
          value={formData.nom_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Nombre *"
          required
        />

        {/* Apellido */}
        <input
          name="ape_usu"
          value={formData.ape_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Apellido *"
          required
        />

        {/* Segundo Nombre */}
        <input
          name="nom_seg_usu"
          value={formData.nom_seg_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Segundo Nombre"
        />

        {/* Segundo Apellido */}
        <input
          name="ape_seg_usu"
          value={formData.ape_seg_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Segundo Apellido"
        />

        {/* Cédula */}
        <input
          name="ced_usu"
          value={formData.ced_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Cédula (10 dígitos) *"
          type="text"
          maxLength={10}
          pattern="[0-9]{10}"
          required
        />

        {/* Teléfono */}
        <input
          name="tel_usu"
          value={formData.tel_usu}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Teléfono"
          type="text"
          maxLength={10}
        />

        {/* Nivel (Carrera + Semestre) - Solo para estudiantes */}
        {esEstudiante && opcionesNivel.length > 0 && (
          <select
            name="niv_usu"
            value={formData.niv_usu}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-xl
                       focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                       transition-all duration-200 text-gray-700 bg-white"
            required
          >
            <option value="">Selecciona tu carrera / semestre</option>
            {opcionesNivel.map((c) => (
              <option key={c.id_niv} value={c.id_niv}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}

        {/* Correo */}
        <input
          className="p-3 border border-gray-300 bg-gray-100 rounded-xl 
                     text-gray-600 cursor-not-allowed"
          disabled
          value={formData.cor_usu}
        />

        {/* Contraseña */}
        <div className="flex gap-2">
          <input
            type="password"
            className="p-3 border border-gray-300 bg-gray-100 rounded-xl 
                       flex-1 text-gray-600 cursor-not-allowed"
            disabled
            value="••••••••"
          />

          <button
            type="button"
            className="bg-gradient-to-r from-[#7A1C1C] to-[#8B1E1E]
                       text-white px-4 rounded-xl font-semibold shadow-md 
                       hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setMostrarModal(true)}
          >
            Cambiar
          </button>
        </div>

        {/* Botón Guardar */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7A1C1C] to-[#8B1E1E]
                       text-white py-3 rounded-xl font-semibold shadow-md 
                       hover:shadow-lg transition-all duration-300 hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}