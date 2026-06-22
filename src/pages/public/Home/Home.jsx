// src/pages/public/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import HeroCarousel from './components/HeroCarousel';
import AnimatedStats from './components/AnimatedStats';
import FeaturedMascotas from './components/FeaturedMascotas';
import EventosSection from './components/EventosSection';
import AliadosSection from './components/AliadosSection';
import ReportarRescate from './components/ReportarRescate';
import api from '../../../services/api';
import './HomeShared.css';

const Home = () => {
  const [stats, setStats] = useState({
    mascotas_rescatadas: 0,
    adopciones_exitosas: 0,
    voluntarios_activos: 0,
    anos_experiencia: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 [Home] Cargando estadísticas...');
        
        const response = await api.get('/fundaciones/estadisticas');
        
        console.log('📊 [Home] Estadísticas recibidas:', response.data);
        
        const data = response.data?.data || response.data || {};
        
        setStats({
          mascotas_rescatadas: data.total_rescatadas || 1250,
          adopciones_exitosas: data.total_adoptadas || 890,
          voluntarios_activos: data.voluntarios || 156,
          anos_experiencia: data.anos_experiencia || 5
        });
        
      } catch (err) {
        console.error('❌ [Home] Error cargando estadísticas:', err);
        setError(err.message);
        
        setStats({
          mascotas_rescatadas: 1250,
          adopciones_exitosas: 890,
          voluntarios_activos: 156,
          anos_experiencia: 5
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="hp-home-modern">
      <HeroCarousel />
      <AnimatedStats stats={stats} />
      <EventosSection />
      <FeaturedMascotas />
      <AliadosSection />
      <ReportarRescate />
    </div>
  );
};

export default Home;