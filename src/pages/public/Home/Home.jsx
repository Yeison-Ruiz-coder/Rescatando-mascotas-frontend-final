// src/pages/public/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import HeroCarousel from './components/HeroCarousel';
import AnimatedStats from './components/AnimatedStats';
import FeaturedMascotas from './components/FeaturedMascotas';
import EventosSection from './components/EventosSection';      // ← nuevo
import AliadosSection from './components/AliadosSection';      // ← nuevo
import ReportarRescate from './components/ReportarRescate';
import './HomeShared.css';

const Home = () => {
  const [stats, setStats] = useState({
    mascotas_rescatadas: 0,
    adopciones_exitosas: 0,
    voluntarios_activos: 0,
    anos_experiencia: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/fundaciones/estadisticas');
        if (response.ok) {
          const data = await response.json();
          setStats({
            mascotas_rescatadas: data.total_rescatadas || 1250,
            adopciones_exitosas: data.total_adoptadas || 890,
            voluntarios_activos: data.voluntarios || 156,
            anos_experiencia: data.anos_experiencia || 5
          });
        }
      } catch (error) {
        setStats({
          mascotas_rescatadas: 1250,
          adopciones_exitosas: 890,
          voluntarios_activos: 156,
          anos_experiencia: 5
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="hp-home-modern">
      <HeroCarousel />
      <AnimatedStats stats={stats} />
      <EventosSection />        {/* ← Nuevo: eventos relevantes */}
      <FeaturedMascotas />
      <AliadosSection />        {/* ← Nuevo: unifica vets + fundaciones */}
      <ReportarRescate />
    </div>
  );
};

export default Home;