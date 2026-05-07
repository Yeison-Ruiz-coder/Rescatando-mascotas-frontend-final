// src/pages/public/Home/components/Cta.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Cta.css';  // ← Importar CSS propio

const Cta = () => {
  const { t } = useTranslation('home');

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">{t('cta.title')}</h2>
        <p className="cta-text">{t('cta.description')}</p>
        <div className="cta-buttons">
          <Link to="/mascotas" className="cta-btn-primary">
            <i className="fas fa-heart me-2"></i>{t('cta.btn_adoptar')}
          </Link>
          <Link to="/rescates/reportar" className="cta-btn-outline">
            <i className="fas fa-life-ring me-2"></i>{t('cta.btn_rescate')}
          </Link>
          <Link to="/donaciones" className="cta-btn-outline">
            <i className="fas fa-donate me-2"></i>{t('cta.btn_donar')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cta;