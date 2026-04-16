import React, { useState, useEffect } from 'react';
import { publicApi } from '../../../services/api';
import './Eventos.css';

const sampleEventos = [
  {
    id: 1,
    nombre: 'Jornada de adopción responsable',
    fecha: '12 de mayo',
    ubicacion: 'Parque Simón Bolívar, Bogotá',
    descripcion: 'Conoce a mascotas en busca de un nuevo hogar y aprende sobre cuidado responsable.',
  },
  {
    id: 2,
    nombre: 'Taller de primeros auxilios para mascotas',
    fecha: '23 de mayo',
    ubicacion: 'Centro comunitario, Medellín',
    descripcion: 'Aprende técnicas básicas para apoyar a tu animal de compañía en emergencias.',
  },
  {
    id: 3,
    nombre: 'Campaña de esterilización gratuita',
    fecha: '3 de junio',
    ubicacion: 'Fundación Corazón Animal, Cali',
    descripcion: 'Protege a tus mascotas y reduce el abandono con una jornada de esterilización segura.',
  }
];

const Eventos = () => {
  const [eventos, setEventos] = useState(sampleEventos);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        const response = await publicApi.get('/eventos');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setEventos(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar eventos desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadEventos();
  }, []);

  const filteredEventos = eventos.filter((item) =>
    [item.nombre, item.fecha, item.ubicacion, item.descripcion]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="eventos-page">
      <header className="eventos-hero">
        <div className="eventos-hero-content">
          <span>Participa en actividades por el bienestar animal</span>
          <h1>Eventos y campañas</h1>
          <p>Encuentra actividades cercanas para apoyar a mascotas, fundaciones y voluntarios.</p>
        </div>
      </header>

      <section className="eventos-search">
        <div className="search-wrapper">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Buscar por evento, fecha o ubicación"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="eventos-list">
        {loading ? (
          <div className="empty-message">Cargando eventos...</div>
        ) : filteredEventos.length === 0 ? (
          <div className="empty-message">No hay eventos con esos criterios.</div>
        ) : (
          <div className="eventos-grid">
            {filteredEventos.map((evento) => (
              <article key={evento.id} className="evento-card">
                <div className="card-header">
                  <h2>{evento.nombre}</h2>
                  <span>{evento.fecha}</span>
                </div>
                <p className="location">{evento.ubicacion}</p>
                <p className="description">{evento.descripcion}</p>
                <button type="button" className="join-button">
                  Más información
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Eventos;
