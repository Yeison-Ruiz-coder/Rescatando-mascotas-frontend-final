import React, { useState, useEffect } from 'react';
import { publicApi } from '../../../services/api';
import './Donaciones.css';

const sampleDonaciones = [
  {
    id: 1,
    titulo: 'Alimento para mascotas en rescate',
    monto: '$30.000',
    descripcion: 'Con tu aporte ayudamos a garantizar alimentación balanceada para perros y gatos en refugios.',
  },
  {
    id: 2,
    titulo: 'Veterinaria y cuidado médico',
    monto: '$50.000',
    descripcion: 'Tu donación cubre consultas, vacunas y tratamientos para animales enfermos.',
  },
  {
    id: 3,
    titulo: 'Refugio y mantención',
    monto: '$80.000',
    descripcion: 'Aporta al alojamiento seguro de mascotas que aún no tienen hogar definitivo.',
  }
];

const Donaciones = () => {
  const [donaciones, setDonaciones] = useState(sampleDonaciones);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDonaciones = async () => {
      try {
        const response = await publicApi.get('/donaciones');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setDonaciones(response.data.data);
        }
      } catch (error) {
        console.warn('No se pudo cargar donaciones desde la API, usando datos locales.');
      } finally {
        setLoading(false);
      }
    };

    loadDonaciones();
  }, []);

  return (
    <div className="donaciones-page">
      <header className="donaciones-hero">
        <div className="donaciones-hero-content">
          <span>Apoya una causa animal</span>
          <h1>Tu aporte hace la diferencia</h1>
          <p>Elige cómo colaborar con alimentos, atención médica y refugio para mascotas en situación de riesgo.</p>
        </div>
      </header>

      <section className="donaciones-list">
        {loading ? (
          <div className="empty-message">Cargando opciones de donación...</div>
        ) : (
          <div className="donaciones-grid">
            {donaciones.map((item) => (
              <article key={item.id} className="donacion-card">
                <div className="donacion-header">
                  <h2>{item.titulo}</h2>
                  <span>{item.monto}</span>
                </div>
                <p>{item.descripcion}</p>
                <button type="button" className="donar-button">
                  Donar ahora
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Donaciones;
