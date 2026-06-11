// src/pages/public/Home/components/ReportarRescate.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ReportarRescate.css';

const ReportarRescate = () => {
  const { t } = useTranslation('home');

  return (
    <section className="rr-reportar-rescate-section">
      <div className="rr-reportar-rescate-container">
        <div className="rr-reportar-rescate-content">
          <div className="rr-reportar-rescate-icon">
            <i className="fas fa-ambulance"></i>
          </div>
          <h2 className="rr-reportar-rescate-title hp-reveal">
            {t('reportar.title') || '¿Viste un animal en peligro?'}
          </h2>
          <p className="rr-reportar-rescate-text hp-reveal hp-delay-100">
            {t('reportar.description') || 'Tu reporte puede salvar una vida. Actúa ahora y ayuda a un animal necesitado.'}
          </p>
          <div className="rr-reportar-rescate-stats hp-reveal hp-delay-200">
            <div className="rr-stat">
              <span className="rr-stat-number">24/7</span>
              <span className="rr-stat-label">{t('reportar.atencion') || 'Atención'}</span>
            </div>
            <div className="rr-stat">
              <span className="rr-stat-number">+500</span>
              <span className="rr-stat-label">{t('reportar.rescates') || 'Rescates atendidos'}</span>
            </div>
            <div className="rr-stat">
              <span className="rr-stat-number">15min</span>
              <span className="rr-stat-label">{t('reportar.respuesta') || 'Tiempo de respuesta'}</span>
            </div>
          </div>
          <Link to="/rescates/reportar" className="rr-reportar-rescate-btn hp-reveal hp-delay-300">
            <i className="fas fa-phone-alt"></i>
            {t('reportar.btn') || 'Reportar Ahora'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReportarRescate;