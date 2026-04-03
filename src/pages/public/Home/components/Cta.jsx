import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Cta = () => {
  const { t } = useTranslation('home');

  return (
    <section className="cta">
      <div className="container">
        <h2 className="cta-title">{t('cta.title')}</h2>
        <p className="cta-text">{t('cta.description')}</p>
        <div className="cta-buttons">
          <Link to="/mascotas" className="btn-light">
            <i className="fas fa-heart me-2"></i>{t('cta.btn_adoptar')}
          </Link>
          <Link to="/rescates/reportar" className="btn-outline-light">
            <i className="fas fa-life-ring me-2"></i>{t('cta.btn_rescate')}
          </Link>
          <Link to="/donaciones" className="btn-outline-light">
            <i className="fas fa-donate me-2"></i>{t('cta.btn_donar')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cta;