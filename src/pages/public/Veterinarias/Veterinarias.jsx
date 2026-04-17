import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../../services/api';
import './Veterinarias.css';

const sampleVeterinarias = [
  {
    id: 1,
    nombre: 'Clínica Animal Vida',
    ciudad: 'Popayán',
    descripcion: 'Atención 24/7 para emergencias veterinarias y cirugías.',
    telefono: '+57 315 555 0123',
    direccion: 'Calle 12 # 34-56'
  },
  {
    id: 2,
    nombre: 'Veterinaria San Francisco',
    ciudad: 'Cali',
    descripcion: 'Especialistas en medicina preventiva y vacunación.',
    telefono: '+57 312 444 6789',
    direccion: 'Carrera 7 # 45-23'
  },
  {
    id: 3,
    nombre: 'Centro Veterinario Esperanza',
    ciudad: 'Pasto',
    descripcion: 'Cuidado integral para perros, gatos y animales exóticos.',
    telefono: '+57 320 987 6543',
    direccion: 'Avenida 3 Nte. # 18-77'
  }
];

const Veterinarias = () => {
  const [veterinarias, setVeterinarias] = useState(sampleVeterinarias);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadVeterinarias = async () => {
      try {
        const response = await publicApi.get('/veterinarias');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setVeterinarias(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar veterinarias desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadVeterinarias();
  }, []);

  const filtered = veterinarias.filter(item =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.ciudad.toLowerCase().includes(search.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="veterinarias-page">
      <header className="veterinarias-hero">
        <div className="veterinarias-hero-content">
          <span>Encuentra la clínica ideal</span>
          <h1>Veterinarias confiables cerca de ti</h1>
          <p>Descubre clínicas veterinarias con atención de calidad, servicios médicos y soporte para el cuidado de tus mascotas.</p>
        </div>
      </header>

      <section className="veterinarias-search">
        <div className="search-wrapper">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Buscar veterinarias, ciudades o servicios"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="veterinarias-list">
        {loading ? (
          <div className="loading-message">Cargando veterinarias...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-message">No se encontraron veterinarias con esos criterios.</div>
        ) : (
          <div className="veterinarias-grid">
            {filtered.map((veterinaria) => (
              <article key={veterinaria.id} className="veterinaria-card">
                <div className="card-header">
                  <h2>{veterinaria.nombre}</h2>
                  <span>{veterinaria.ciudad}</span>
                </div>
                <p>{veterinaria.descripcion}</p>
                <div className="card-footer">
                  <div>
                    <strong>Teléfono</strong>
                    <span>{veterinaria.telefono}</span>
                  </div>
                  <div>
                    <strong>Dirección</strong>
                    <span>{veterinaria.direccion}</span>
                  </div>
                </div>
                <Link to={`/veterinarias/${veterinaria.id}`} className="card-detail-link">
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

export default Veterinarias;
