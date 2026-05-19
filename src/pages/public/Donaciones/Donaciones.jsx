// Donaciones.jsx - versión con i18n
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ← Agregar
import { publicApi } from '../../../services/api';
import './Donaciones.css';

const Donaciones = () => {
  const { t } = useTranslation('donaciones'); // ← Agregar
  
  const [donaciones, setDonaciones] = useState([]);
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
          <span>{t('hero.badge') || 'Apoya una causa animal'}</span>
          <h1>{t('hero.title') || 'Tu aporte hace la diferencia'}</h1>
          <p>{t('hero.description') || 'Elige cómo colaborar con alimentos, atención médica y refugio para mascotas en situación de riesgo.'}</p>
        </div>
      </header>

      <section className="donaciones-list">
        {loading ? (
          <div className="empty-message">{t('cargando') || 'Cargando opciones de donación...'}</div>
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
                  {t('boton_donar') || 'Donar ahora'}
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