import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation('home');

  return (
    <section className="hero">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0 hero-content animate-fade-in-up">
            <h1 className="hero-title">{t('hero.title')}</h1>
            <p className="hero-text">{t('hero.welcome')}</p>
            <p className="hero-text">{t('hero.description')}</p>
            <div className="hero-buttons">
              <Link to="/mascotas" className="btn-primary">
                <i className="fas fa-heart me-2"></i>
                {t('hero.cta')}
              </Link>
              <a href="#proceso" className="btn-outline">
                {t('hero.process')}
              </a>
            </div>
          </div>
          <div className="col-lg-6 text-center animate-fade-in-up delay-1">
            <div className="hero-image">
              <img
                src="https://media.istockphoto.com/id/2194197607/es/foto/madre-feliz-padre-linda-peque%C3%B1a-hija-abrazada-junto-con-perro-golden-retriever.jpg?s=612x612&w=0&k=20&c=t5RkkLVjmFiWOQB-VrstAweh-kVAJxebD-a5-g_2cwA="
                alt="Familia con mascota"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;