import React, { useState, useEffect } from 'react';
import { publicApi } from '../../../services/api';
import './Tienda.css';

const sampleProductos = [
  {
    id: 1,
    nombre: 'Kong para perros',
    precio: '$45.000',
    descripcion: 'Juguete resistente ideal para mantener a tu perro activo y entretenido.',
    imagen: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    nombre: 'Cama para gato',
    precio: '$35.000',
    descripcion: 'Cama suave y cómoda para el descanso de gatos adultos y jóvenes.',
    imagen: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    nombre: 'Plato antideslizante',
    precio: '$20.000',
    descripcion: 'Ideal para alimentos y agua, evita derrames en el piso.',
    imagen: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80'
  }
];

const Tienda = () => {
  const [productos, setProductos] = useState(sampleProductos);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const response = await publicApi.get('/tienda');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setProductos(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar productos desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, []);

  const filteredProductos = productos.filter((item) =>
    [item.nombre, item.descripcion]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="tienda-page">
      <header className="tienda-hero">
        <div className="tienda-hero-content">
          <span>Compra productos pensados para tus mascotas</span>
          <h1>Tienda solidaria</h1>
          <p>Productos útiles y responsables con el bienestar animal. Cada compra apoya la causa.</p>
        </div>
      </header>

      <section className="tienda-search">
        <div className="search-wrapper">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Buscar productos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="tienda-list">
        {loading ? (
          <div className="empty-message">Cargando productos...</div>
        ) : filteredProductos.length === 0 ? (
          <div className="empty-message">No hay productos con esa búsqueda.</div>
        ) : (
          <div className="tienda-grid">
            {filteredProductos.map((producto) => (
              <article key={producto.id} className="producto-card">
                <img src={producto.imagen} alt={producto.nombre} />
                <div className="producto-body">
                  <h2>{producto.nombre}</h2>
                  <span className="precio">{producto.precio}</span>
                  <p>{producto.descripcion}</p>
                  <button type="button" className="comprar-button">
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Tienda;
