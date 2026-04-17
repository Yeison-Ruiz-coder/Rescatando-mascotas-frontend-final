import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../../services/api';
import './Veterinarias.css';

const sampleVeterinarias = [
  {
    id: 1,
    nombre: 'Clínica Animal Vida',
    ciudad: 'Popayán',
    descripcion: 'Atención 24/7 para emergencias veterinarias y cirugías.',
    telefono: '+57 315 555 0123',
    direccion: 'Calle 12 # 34-56',
    servicios: ['Urgencias', 'Cirugías', 'Vacunación', 'Medicina preventiva']
  },
  {
    id: 2,
    nombre: 'Veterinaria San Francisco',
    ciudad: 'Cali',
    descripcion: 'Especialistas en medicina preventiva y vacunación.',
    telefono: '+57 312 444 6789',
    direccion: 'Carrera 7 # 45-23',
    servicios: ['Consultas', 'Vacunas', 'Desparasitaciones', 'Consultas online']
  },
  {
    id: 3,
    nombre: 'Centro Veterinario Esperanza',
    ciudad: 'Pasto',
    descripcion: 'Cuidado integral para perros, gatos y animales exóticos.',
    telefono: '+57 320 987 6543',
    direccion: 'Avenida 3 Nte. # 18-77',
    servicios: ['Exóticos', 'Laboratorio', 'Rayos X', 'Hospitalización']
  }
];

const VeterinariaDetalle = () => {
  const { id } = useParams();
  const [veterinaria, setVeterinaria] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetalle = async () => {
      try {
        const response = await publicApi.get(`/veterinarias/${id}`);
        if (response.data?.success && response.data.data) {
          setVeterinaria(response.data.data);
          return;
        }
      } catch (error) {
        // fallback a datos locales
      }

      const item = sampleVeterinarias.find((item) => String(item.id) === String(id));
      setVeterinaria(item || null);
    };

    loadDetalle().finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="veterinarias-page">
        <div className="loading-message">Cargando veterinaria...</div>
      </div>
    );
  }

  if (!veterinaria) {
    return (
      <div className="veterinarias-page">
        <div className="empty-message">No se encontró la veterinaria solicitada.</div>
        <div className="detail-back-link">
          <Link to="/veterinarias">Volver a veterinarias</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="veterinarias-page">
      <div className="detalle-header">
        <div>
          <h1>{veterinaria.nombre}</h1>
          <p className="detalle-subtitle">{veterinaria.ciudad}</p>
        </div>
        <Link to="/veterinarias" className="detalle-back-button">
          ← Volver a veterinarias
        </Link>
      </div>

      <div className="detalle-card">
        <p className="detalle-description">{veterinaria.descripcion}</p>

        <div className="detalle-grid">
          <div>
            <strong>Dirección</strong>
            <p>{veterinaria.direccion}</p>
          </div>
          <div>
            <strong>Teléfono</strong>
            <p>{veterinaria.telefono}</p>
          </div>
        </div>

        <div className="detalle-services">
          <strong>Servicios disponibles</strong>
          <ul>
            {veterinaria.servicios?.map((servicio, index) => (
              <li key={index}>{servicio}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VeterinariaDetalle;
