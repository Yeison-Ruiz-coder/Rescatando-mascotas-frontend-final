// Proceso.jsx modificado
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Proceso.css'; // Creamos este archivo

const Proceso = () => {
  const { t } = useTranslation('home');

  const steps = [
    { icon: 'fas fa-search', title: t('proceso.step1_title'), desc: t('proceso.step1_desc') },
    { icon: 'fas fa-edit', title: t('proceso.step2_title'), desc: t('proceso.step2_desc') },
    { icon: 'fas fa-comments', title: t('proceso.step3_title'), desc: t('proceso.step3_desc') },
    { icon: 'fas fa-home', title: t('proceso.step4_title'), desc: t('proceso.step4_desc') }
  ];

  return (
    <section className="proceso-section">
      <div className="proceso-container">
        <h2 className="proceso-title">{t('proceso.title')}</h2>
        <p className="proceso-subtitle">{t('proceso.subtitle')}</p>

        <div className="proceso-steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="proceso-step">
              <div className="proceso-step-icon">
                <i className={step.icon}></i>
              </div>
              <h3 className="proceso-step-title">{step.title}</h3>
              <p className="proceso-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="proceso-footer">
          <Link to="/mascotas" className="proceso-btn">
            <i className="fas fa-paw me-2"></i>{t('proceso.btn_iniciar')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Proceso;