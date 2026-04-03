// src/pages/public/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import Hero from './components/Hero';
import Stats from './components/Stats';
import MascotaCard from '../../../components/common/MascotaCard/MascotaCard'; // 🔥 Importar componente reutilizable
import Proceso from './components/Proceso';
import Testimonios from './components/Testimonios';
import Cta from './components/Cta';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Home.css';

const Home = () => {
  const { t } = useTranslation('home');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mascotas_rescatadas: '1,200+',
    adopciones_exitosas: '850+',
    voluntarios_activos: '150+',
    anos_experiencia: '5'
  });

  useEffect(() => {
    const fetchMascotasRecientes = async () => {
      try {
        const response = await api.get('/mascotas?limit=3');
        if (response.data.success) {
          const mascotasData = response.data.data.data || [];
          setMascotas(mascotasData.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching mascotas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotasRecientes();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_STORAGE_URL || 'http://rescatando-mascotas-forever.test/storage'}/${path}`;
  };

  return (
    <div className="home-page">
      <Hero />
      <Stats stats={stats} />
      
      <section id="mascotas" className="mascotas-section">
        <div className="container">
          <h2 className="section-title">{t('mascotas_disponibles')}</h2>
          <p className="section-subtitle">{t('mascotas_subtitle')}</p>

          {loading ? (
            <LoadingSpinner />
          ) : mascotas.length > 0 ? (
            <div className="mascotas-grid">
              {mascotas.map((mascota) => (
                <MascotaCard
                  key={mascota.id}
                  mascota={mascota}
                  getImageUrl={getImageUrl}
                  showFundacion={true}
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="lead">{t('sin_mascotas')}</p>
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/mascotas" className="btn-primary-custom">
              <i className="fas fa-paw me-2"></i>
              {t('ver_todas')}
            </Link>
          </div>
        </div>
      </section>

      <Proceso />
      <Testimonios />
      <Cta />
    </div>
  );
};

export default Home;