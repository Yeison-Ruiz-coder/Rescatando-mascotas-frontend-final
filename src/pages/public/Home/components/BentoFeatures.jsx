// src/pages/public/Home/components/BentoFeatures.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BentoFeatures.css';

const BentoFeatures = () => {
  const { t } = useTranslation('home');

  const features = [
    { 
      title: 'Adopción Segura', 
      description: 'Proceso transparente y seguimiento post-adopción',
      icon: 'fas fa-shield-alt',
      size: 'large',
      color: '#667eea'
    },
    { 
      title: 'Rescate 24/7', 
      description: 'Atención inmediata a reportes de emergencia',
      icon: 'fas fa-ambulance',
      size: 'small',
      color: '#ff8c42'
    },
    { 
      title: 'Voluntarios', 
      description: 'Únete a nuestra red de ayudantes',
      icon: 'fas fa-hands-helping',
      size: 'small',
      color: '#10b981'
    },
    { 
      title: 'Veterinarias Aliadas', 
      description: 'Red de profesionales comprometidos',
      icon: 'fas fa-clinic-medical',
      size: 'medium',
      color: '#8b5cf6'
    },
    { 
      title: 'Fundaciones', 
      description: 'Trabajamos con las mejores organizaciones',
      icon: 'fas fa-building',
      size: 'medium',
      color: '#ec4899'
    },
    { 
      title: 'Educación', 
      description: 'Programas de tenencia responsable',
      icon: 'fas fa-graduation-cap',
      size: 'small',
      color: '#06b6d4'
    }
  ];

  const getSizeClass = (size) => {
    switch(size) {
      case 'large': return 'bf-bento-large';
      case 'medium': return 'bf-bento-medium';
      default: return 'bf-bento-small';
    }
  };

  return (
    <section className="bf-bento-section">
      <div className="bf-bento-container">  {/* ← Contenedor con ancho limitado */}
        <h2 className="hp-section-title hp-reveal">¿Por qué elegirnos?</h2>
        <p className="hp-section-subtitle hp-reveal hp-delay-100">
          Más de 5 años transformando vidas, una mascota a la vez
        </p>
        
        <div className="bf-bento-grid-modern">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bf-bento-item ${getSizeClass(feature.size)} hp-reveal hp-delay-${(index % 4) * 100}`}
              style={{ '--feature-color': feature.color }}
            >
              <div className="bf-bento-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="bf-bento-title">{feature.title}</h3>
              <p className="bf-bento-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;