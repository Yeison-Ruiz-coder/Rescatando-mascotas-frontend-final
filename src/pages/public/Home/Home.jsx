// src/pages/public/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import HeroCarousel from './components/HeroCarousel';
import AnimatedStats from './components/AnimatedStats';
import MasonryMascotas from './components/MasonryMascotas';
import BentoFeatures from './components/BentoFeatures';
import TimelineEventos from './components/TimelineEventos';
import VeterinariasDestacadas from './components/VeterinariasDestacadas';
import FundacionesDestacadas from './components/FundacionesDestacadas';
import ReportarRescate from './components/ReportarRescate';
import SeccionSuscripciones from './components/SeccionSuscripciones';
import FinalCTA from './components/FinalCTA';
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
      <MasonryMascotas />
      <BentoFeatures />
      <TimelineEventos />
      <VeterinariasDestacadas />
      <FundacionesDestacadas />
      <ReportarRescate />
      <SeccionSuscripciones />
      <FinalCTA />
    </div>
  );
};

export default Home;