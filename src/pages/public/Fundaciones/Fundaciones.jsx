import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Fundaciones = () => {
  const [fundaciones, setFundaciones] = useState(sampleFundaciones);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadFundaciones = async () => {
      try {
        const response = await publicApi.get('/fundaciones');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setFundaciones(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar fundaciones desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadFundaciones();
  }, []);

  const filtered = fundaciones.filter(item =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.ciudad.toLowerCase().includes(search.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fundaciones-page">
      <header className="fundaciones-hero">
        <div className="fundaciones-hero-content">
          <span>Conoce las fundaciones que ayudan a las mascotas</span>
          <h1>Fundaciones en tu ciudad</h1>
          <p>Explora organizaciones que rescatan, cuidan y buscan hogares responsables para animales.</p>
        </div>
      </header>

      <section className="fundaciones-search">
        <div className="search-wrapper">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Buscar fundaciones, ciudades o programas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="fundaciones-list">
        {loading ? (
          <div className="loading-message">Cargando fundaciones...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-message">No se encontraron fundaciones con esos criterios.</div>
        ) : (
          <div className="fundaciones-grid">
            {filtered.map((fundacion) => (
              <article key={fundacion.id} className="fundacion-card">
                <div className="card-header">
                  <h2>{fundacion.nombre}</h2>
                  <span>{fundacion.ciudad}</span>
                </div>
                <p>{fundacion.descripcion}</p>
                <div className="card-footer">
                  <div>
                    <strong>Teléfono</strong>
                    <span>{fundacion.telefono}</span>
                  </div>
                  <div>
                    <strong>Dirección</strong>
                    <span>{fundacion.direccion}</span>
                  </div>
                </div>
                <Link to={`/fundaciones/${fundacion.id}`} className="card-detail-link">
                  Ver detalles
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Fundaciones;
