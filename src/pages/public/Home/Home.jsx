// src/pages/public/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import Stats from './components/Stats';
import MascotaCard from '../../../components/common/MascotaCard/MascotaCard';
import Proceso from './components/Proceso';
import Testimonios from './components/Testimonios';
import Cta from './components/Cta';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Home.css';   // ← Cambiado: usando .css normal

const Home = () => {
  const { t } = useTranslation('home');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    mascotas_rescatadas: '1,200+',
    adopciones_exitosas: '850+',
    voluntarios_activos: '150+',
    anos_experiencia: '5'
  });

  // Slides del carrusel
  const slides = [
    {
      id: 1,
      title: t('hero.slide1_title') || 'Dales una segunda oportunidad',
      highlight: t('hero.slide1_highlight') || 'Ellos te esperan',
      description: t('hero.slide1_desc') || 'Cada animal merece un hogar lleno de amor. Adopta y cambia una vida.',
      image: '/img/img3.jpg',
      ctaText: t('hero.btn_adoptar') || 'Adoptar',
      ctaLink: '/mascotas'
    },
    {
      id: 2,
      title: t('hero.slide2_title') || 'Sé parte del cambio',
      highlight: t('hero.slide2_highlight') || 'Reporta un rescate',
      description: t('hero.slide2_desc') || 'Tu reporte puede salvar una vida. Actúa ahora y ayuda a un animal necesitado.',
      image: '/img/img1.jpg',
      ctaText: t('hero.btn_rescate') || 'Reportar Rescate',
      ctaLink: '/rescates/reportar'
    },
    {
      id: 3,
      title: t('hero.slide3_title') || 'Haz una donación',
      highlight: t('hero.slide3_highlight') || 'Tu apoyo es vital',
      description: t('hero.slide3_desc') || 'Con tu ayuda podemos rescatar, rehabilitar y dar hogar a más animales.',
      image: '/img/img4.jpg',
      ctaText: t('hero.btn_donar') || 'Donar',
      ctaLink: '/suscripciones'
    }
  ];

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

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_STORAGE_URL || 'http://rescatando-mascotas-forever.test/storage'}/${path}`;
  };

  return (
    <div className="home-page">
      {/* ===== CARRUSEL HERO FULL WIDTH ===== */}
      <section className="hero-carousel-full">
        <div className="carousel-container">
          <div 
            className="carousel-slides"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="carousel-slide">
                <div 
                  className="carousel-bg"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="carousel-overlay"></div>
                </div>
                <div className="carousel-content">
                  <div className="container">
                    <div className="carousel-text">
                      <h2 className="carousel-pre-title">{slide.title}</h2>
                      <h1 className="carousel-title">{slide.highlight}</h1>
                      <p className="carousel-description">{slide.description}</p>
                      <Link to={slide.ctaLink} className="carousel-btn">
                        <i className="fas fa-heart"></i> {slide.ctaText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-nav carousel-prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="carousel-nav carousel-next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="carousel-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <Stats stats={stats} />
      
      {/* ===== MASCOTAS DISPONIBLES ===== */}
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

      {/* ===== PROCESO ===== */}
      <Proceso />
      
      {/* ===== TESTIMONIOS ===== */}
      <Testimonios />
      
      {/* ===== CTA ===== */}
      <Cta />
    </div>
  );
};

export default Home;