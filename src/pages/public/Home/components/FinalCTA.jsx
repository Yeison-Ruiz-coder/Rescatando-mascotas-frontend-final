// src/pages/public/Home/components/FinalCTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './FinalCTA.css';

const FinalCTA = () => {
  const { t } = useTranslation('home');

  return (
    <section className="fc-final-cta-section">
      <div className="fc-final-cta-container">
        <div className="fc-final-cta-content">
          <h2 className="fc-final-cta-title hp-reveal">
            {t('cta.title') || '¿Listo para cambiar una vida?'}
          </h2>
          <p className="fc-final-cta-text hp-reveal hp-delay-100">
            {t('cta.description') || 'Cada adopción, donación y voluntario cuenta. Únete a nuestra misión.'}
          </p>
          <div className="fc-final-cta-buttons hp-reveal hp-delay-200">
            <Link to="/mascotas" className="fc-final-cta-btn-primary">
              <i className="fas fa-heart"></i>
              {t('cta.btn_adoptar') || 'Adoptar'}
            </Link>
            <Link to="/rescates/reportar" className="fc-final-cta-btn-outline">
              <i className="fas fa-life-ring"></i>
              {t('cta.btn_rescate') || 'Reportar Rescate'}
            </Link>
            <Link to="/suscripciones" className="fc-final-cta-btn-outline">
              <i className="fas fa-donate"></i>
              {t('cta.btn_donar') || 'Donar'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;