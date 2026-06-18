// src/pages/public/Home/components/HeroCarousel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HeroCarousel.css';

const HeroCarousel = () => {
  const { t } = useTranslation('home');
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hc-hero-carousel-modern">
      <div className="hc-carousel-container-modern">
        <div 
          className="hc-carousel-slides-modern"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="hc-carousel-slide-modern">
              <div 
                className="hc-carousel-bg-modern"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="hc-carousel-overlay-modern"></div>
              </div>
              <div className="hc-carousel-content-modern">
                <div className="hc-container-modern">
                  {/* ✅ ELIMINADAS las clases "reveal-up delay-200" y "reveal-scale delay-400" */}
                  <div className="hc-carousel-text-modern">
                    <h2 className="hc-carousel-pre-title-modern">{slide.title}</h2>
                    <h1 className="hc-carousel-title-modern">{slide.highlight}</h1>
                    <p className="hc-carousel-description-modern">{slide.description}</p>
                    <Link to={slide.ctaLink} className="hc-carousel-btn-modern">
                      <i className="fas fa-heart"></i> {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="hc-carousel-nav-modern hc-carousel-prev-modern" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="hc-carousel-nav-modern hc-carousel-next-modern" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="hc-carousel-dots-modern">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hc-carousel-dot-modern ${index === currentSlide ? 'hc-active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;