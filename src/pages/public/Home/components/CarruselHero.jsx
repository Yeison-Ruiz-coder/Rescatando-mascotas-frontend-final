import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarruselHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ✅ Configuración centralizada
  const BOTON_CONFIG = {
    texto: "Adoptar",
    ruta: "/mascotas"
  };

  const slides = [
    {
      id: 1,
      url: "../public/img/img1.jpg", 
      badge: "LAIKA Member®",
      title: "EL UNIVERSO DONDE TU PET-AMIGO",
      titleHighlight: "TIENE CORONA",
      description: "Cuida a tu mejor amigo",
      detail: "Todo lo que necesita para ser feliz y saludable.",
      buttonText: BOTON_CONFIG.texto,
      buttonLink: BOTON_CONFIG.ruta
    },
    {
      id: 2,
      url: "../public/img/img3.jpg", 
      badge: "",
      title: "Mi ama a tu felino",
      titleHighlight: "",
      description: "Productos hechos para su comodidad y diversión.",
      detail: "",
      buttonText: BOTON_CONFIG.texto,
      buttonLink: BOTON_CONFIG.ruta
    },
    {
      id: 3,
      url: "../public/img/img4.jpg", 
      badge: "",
      title: "Favoritos para tu PET-AMIGO",
      titleHighlight: "",
      description: "Descubre descuentos exclusivos, combos y precios especiales",
      detail: "en nuestros productos por tiempo limitado.",
      buttonText: BOTON_CONFIG.texto,
      buttonLink: BOTON_CONFIG.ruta
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const handleManualNavigation = (callback) => {
    setIsAutoPlaying(false);
    callback();
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="carrusel-laika-full">
      <div className="carrusel-laika-container-full">
        <div className="carrusel-laika-slides-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`carrusel-laika-slide-full ${index === currentIndex ? 'active' : ''}`}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <img
                src={slide.url}
                alt={slide.title}
                className="carrusel-laika-bg-full"
              />
              <div className="carrusel-laika-overlay-full"></div>
              
              <div className="carrusel-laika-content-full">
                <div className="container">
                  <div className="laika-text-content">
                    {slide.badge && <span className="laika-badge">{slide.badge}</span>}
                    {slide.title && <h1 className="laika-main-title">{slide.title}</h1>}
                    {slide.titleHighlight && <h2 className="laika-highlight">{slide.titleHighlight}</h2>}
                    {slide.description && <p className="laika-description-full">{slide.description}</p>}
                    {slide.detail && <p className="laika-detail-full">{slide.detail}</p>}
                    <Link to={slide.buttonLink} className="laika-button">
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carrusel-laika-nav carrusel-laika-prev"
          onClick={() => handleManualNavigation(prevSlide)}
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className="carrusel-laika-nav carrusel-laika-next"
          onClick={() => handleManualNavigation(nextSlide)}
        >
          <ChevronRight size={28} />
        </button>

        <div className="carrusel-laika-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carrusel-laika-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleManualNavigation(() => goToSlide(index))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarruselHero;