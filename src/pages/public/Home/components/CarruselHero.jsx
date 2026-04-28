import React, { useState, useEffect } from 'react';
import { PawPrint, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarruselHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const slides = [
    {
      id: 1,
      url: "img/mascotas3.png",
      title: "Ellos solo necesitan una oportunidad",
      description: "Más de 1,200 mascotas rescatadas. Cada animal tiene una historia que sanar.",
      buttonText: "Conócelos",
      color: "#FF6B6B"
    },
    {
      id: 2,
      url: "img/NIÑAPERRO.jpg",
      title: "Un hogar lleno de amor te espera",
      description: "Ellos te necesitan. La adopción cambia vidas.",
      buttonText: "Adoptar",
      color: "#4ECDC4"
    },
    {
      id: 3,
      url: "img/gatis1.jpg",
      title: "Ellos te esperan con el corazón abierto",
      description: "Dales una segunda oportunidad. Encuentra a tu compañero ideal.",
      buttonText: "Ver Mascotas",
      color: "#FFEAA7"
    },
    {
      id: 4,
      url: "img/perritoygatis.jpg",
      title: "protegelos, ellos solo quieren un hogar",
      description: "Dales una segunda oportunidad. Encuentra a tu compañero ideal.",
      buttonText: "Ver Mascotas",
      color: "#FFEAA7"
    },
    {
      id: 5,
      url: "img/gatis3.jpg",
      title: "No compres, adopta un amigo para toda la vida",
      description: "Dales una segunda oportunidad. Encuentra a tu compañero ideal.",
      buttonText: "Ver Mascotas",
      color: "#FFEAA7"
    },
    {
      id: 6,
      url: "img/todos.jpg",
      title: "Ellos quieren ser parte de tu familia",
      description: "Dales una segunda oportunidad. Encuentra a tu compañero ideal.",
      buttonText: "Ver Mascotas",
      color: "#FFEAA7"
    },
  ];

  // Cambio automático cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % slides.length;
        setNextIndex((next + 1) % slides.length);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="carrusel-elegante">
      {/* Slides principales */}
      <div className="slides-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? 'active' : ''} ${
              index === nextIndex ? 'next' : ''
            }`}
          >
            {/* Imagen de fondo */}
            <div className="slide-bg">
              <img src={slide.url} alt={slide.title} />
              <div className="overlay"></div>
            </div>

            {/* Contenido */}
            <div className="slide-content">
              <div className="content-inner">
                <div className="badge-container">
                  <span className="badge">
                    <Heart size={16} fill="#FF6B6B" stroke="#FF6B6B" />
                    Adopta, no compres
                  </span>
                  <span className="sparkle">
                    <Sparkles size={14} />
                  </span>
                </div>
                
                <h1 className="title">{slide.title}</h1>
                <p className="description">{slide.description}</p>
                
                <Link to="/mascotas" className="btn-adoptar">
                  {slide.buttonText}
                  <PawPrint size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores elegantes */}
      <div className="indicadores">
        {slides.map((slide, index) => (
          <button
            key={index}
            className={`indicador ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentIndex(index);
              setNextIndex((index + 1) % slides.length);
            }}
          >
            <span className="indicador-barra"></span>
          </button>
        ))}
      </div>

      <style>{`
        .carrusel-elegante {
          position: relative;
          width: 100%;
          height: 800px;
          overflow: hidden;
          background: #000;
        }

        .slides-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .slide.active {
          opacity: 1;
          z-index: 2;
        }

        .slide.next {
          z-index: 1;
        }

        .slide-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .slide-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1);
          transition: transform 6s ease-out;
        }

        .slide.active .slide-bg img {
          transform: scale(1.08);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        .slide-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 3rem;
        }

        .content-inner {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          transform: translateY(30px);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
        }

        .slide.active .content-inner {
          transform: translateY(0);
          opacity: 1;
        }

        .badge-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          color: #FF6B6B;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .sparkle {
          animation: sparkle 2s infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .title {
          font-size: 2.2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: -0.5px;
        }

        .description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          font-weight: 400;
        }

        .btn-adoptar {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #FF6B6B, #ff8e8e);
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .btn-adoptar:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
          background: linear-gradient(135deg, #ff5252, #ff6b6b);
        }

        .btn-adoptar svg {
          transition: transform 0.3s ease;
        }

        .btn-adoptar:hover svg {
          transform: translateX(4px);
        }

        /* Indicadores elegantes */
        .indicadores {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
          z-index: 10;
        }

        .indicador {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 3px;
          border-radius: 3px;
          overflow: hidden;
        }

        .indicador-barra {
          display: block;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          position: relative;
          overflow: hidden;
        }

        .indicador.active .indicador-barra::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          background: #FF6B6B;
          animation: progressBar 5s linear forwards;
        }

        @keyframes progressBar {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .indicador:hover .indicador-barra {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Efecto de transición elegante entre slides */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .carrusel-elegante {
            height: 450px;
          }
          
          .title {
            font-size: 1.5rem;
          }
          
          .description {
            font-size: 0.85rem;
          }
          
          .btn-adoptar {
            padding: 0.6rem 1.5rem;
            font-size: 0.85rem;
          }
          
          .indicador {
            width: 30px;
          }
        }

        @media (max-width: 480px) {
          .carrusel-elegante {
            height: 400px;
          }
          
          .title {
            font-size: 1.3rem;
          }
          
          .content-inner {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CarruselHero;