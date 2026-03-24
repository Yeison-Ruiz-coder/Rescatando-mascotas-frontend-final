import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Rescatando Mascotas Forever</h1>
        <p className="hero-subtitle">Sanando su historia.</p>
        <p className="hero-description">
          Dale una segunda oportunidad a un animal que lo necesita. 
          Miles de mascotas esperan un hogar lleno de amor.
        </p>
        
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/mascotas')}
          >
            Adoptar Ahora
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/adopciones/proceso')}
          >
            Conocer el Proceso
          </button>
        </div>
      </section>

      {/* Features */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-paw"></i>
          </div>
          <h3>{t('features.adopcion.title')}</h3>
          <p>{t('features.adopcion.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-ambulance"></i>
          </div>
          <h3>{t('features.rescates.title')}</h3>
          <p>{t('features.rescates.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <h3>{t('features.donaciones.title')}</h3>
          <p>{t('features.donaciones.description')}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">1200+</span>
          <span className="stat-label">{t('stats.rescates')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">850+</span>
          <span className="stat-label">{t('stats.adopciones')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">150+</span>
          <span className="stat-label">{t('stats.fundaciones')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">5</span>
          <span className="stat-label">{t('stats.veterinarias')}</span>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="welcome-section">
        <h2 className="welcome-title">BIENVENIDOS A RESCATANDO MASCOTAS FOREVER!!</h2>
        <p className="welcome-text">
          Somos una fundación dedicada al rescate, rehabilitación y adopción de 
          animales en situación de calle. Trabajamos día a día para darles una 
          segunda oportunidad y encontrarles un hogar lleno de amor.
        </p>
      </section>
    </div>
  );
};

export default Home;