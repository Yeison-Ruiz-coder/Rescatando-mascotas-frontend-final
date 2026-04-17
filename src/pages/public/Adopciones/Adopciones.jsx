import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../../services/api';
import './Adopciones.css';

const sampleAdopciones = [
  {
    id: 1,
    nombre: 'Luna',
    especie: 'Perro',
    edad: '2 años',
    ciudad: 'Bogotá',
    descripcion: 'Cariñosa y activa, busca un hogar con mucho amor y espacio para correr.',
    imagen: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    nombre: 'Nube',
    especie: 'Gato',
    edad: '1 año',
    ciudad: 'Medellín',
    descripcion: 'Tranquila y curiosa, ideal para hogares con o sin niños.',
    imagen: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    nombre: 'Canelo',
    especie: 'Perro',
    edad: '3 años',
    ciudad: 'Cali',
    descripcion: 'Muy sociable y obediente, se adapta bien a familias y adopciones responsables.',
    imagen: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80'
  }
];

const Adopciones = () => {
  const [adopciones, setAdopciones] = useState(sampleAdopciones);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdopciones = async () => {
      try {
        const response = await publicApi.get('/adopciones');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setAdopciones(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar adopciones desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadAdopciones();
  }, []);

  const filteredAdopciones = adopciones.filter((item) =>
    [item.nombre, item.especie, item.ciudad, item.descripcion]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="adopciones-page">
      <header className="adopciones-hero">
        <div className="adopciones-hero-content">
          <span>Adopta una mascota y cambia una vida</span>
          <h1>Historias que esperan un hogar</h1>
          <p>Explora perros y gatos listos para ser adoptados por familias responsables.</p>
        </div>
      </header>

      <section className="adopciones-search">
        <div className="search-wrapper">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Buscar por nombre, especie o ciudad"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="adopciones-list">
        {loading ? (
          <div className="empty-message">Cargando opciones de adopción...</div>
        ) : filteredAdopciones.length === 0 ? (
          <div className="empty-message">No se encontraron mascotas con esos criterios.</div>
        ) : (
          <div className="adopciones-grid">
            {filteredAdopciones.map((item) => (
              <article key={item.id} className="adopcion-card">
                <img src={item.imagen} alt={item.nombre} />
                <div className="card-body">
                  <div className="card-title">
                    <h2>{item.nombre}</h2>
                    <span>{item.especie}</span>
                  </div>
                  <p className="meta">{item.edad} · {item.ciudad}</p>
                  <p className="description">{item.descripcion}</p>
                  <Link to={`/solicitar-adopcion/${item.id}`} className="card-action">
                    Solicitar adopción
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Adopciones;
