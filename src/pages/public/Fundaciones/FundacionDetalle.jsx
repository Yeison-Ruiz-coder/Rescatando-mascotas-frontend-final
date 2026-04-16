import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../../services/api';
import './Fundaciones.css';

const sampleFundaciones = [
  {
    id: 1,
    nombre: 'Fundación Patitas Alegres',
    ciudad: 'Cali',
    descripcion: 'Rescate y adopción de perros y gatos con programas de rehabilitación.',
    telefono: '+57 313 123 4567',
    direccion: 'Calle 8 # 34-56',
    programas: ['Adopción', 'Educación comunitaria', 'Voluntariado']
  },
  {
    id: 2,
    nombre: 'Corazón Animal',
    ciudad: 'Bogotá',
    descripcion: 'Apoyo a animales en situación de calle y campañas de esterilización.',
    telefono: '+57 320 987 6543',
    direccion: 'Carrera 15 # 45-67',
    programas: ['Esterilización', 'Campañas de salud', 'Albergue temporal']
  },
  {
    id: 3,
    nombre: 'Huellas de Esperanza',
    ciudad: 'Medellín',
    descripcion: 'Protección animal y adopciones responsables con seguimiento post-adopción.',
    telefono: '+57 315 765 4321',
    direccion: 'Avenida 10 # 24-18',
    programas: ['Seguimiento post-adopción', 'Educación', 'Eventos solidarios']
  }
];

const FundacionDetalle = () => {
  const { id } = useParams();
  const [fundacion, setFundacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetalle = async () => {
      try {
        const response = await publicApi.get(`/fundaciones/${id}`);
        if (response.data?.success && response.data.data) {
          setFundacion(response.data.data);
          return;
        }
      } catch (error) {
        // fallback local
      }

      const item = sampleFundaciones.find((item) => String(item.id) === String(id));
      setFundacion(item || null);
    };

    loadDetalle().finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="fundaciones-page">
        <div className="loading-message">Cargando fundación...</div>
      </div>
    );
  }

  if (!fundacion) {
    return (
      <div className="fundaciones-page">
        <div className="empty-message">No se encontró la fundación solicitada.</div>
        <div className="detail-back-link">
          <Link to="/fundaciones">Volver a fundaciones</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fundaciones-page">
      <div className="detalle-header">
        <div>
          <h1>{fundacion.nombre}</h1>
          <p className="detalle-subtitle">{fundacion.ciudad}</p>
        </div>
        <Link to="/fundaciones" className="detalle-back-button">
          ← Volver a fundaciones
        </Link>
      </div>

      <div className="detalle-card">
        <p className="detalle-description">{fundacion.descripcion}</p>

        <div className="detalle-grid">
          <div>
            <strong>Dirección</strong>
            <p>{fundacion.direccion}</p>
          </div>
          <div>
            <strong>Teléfono</strong>
            <p>{fundacion.telefono}</p>
          </div>
        </div>

        <div className="detalle-services">
          <strong>Programas disponibles</strong>
          <ul>
            {fundacion.programas?.map((programa, index) => (
              <li key={index}>{programa}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FundacionDetalle;
