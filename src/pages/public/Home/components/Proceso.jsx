import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Proceso = () => {
  const { t } = useTranslation('home');

  const steps = [
    { icon: 'fas fa-search', title: t('proceso.step1_title'), desc: t('proceso.step1_desc') },
    { icon: 'fas fa-edit', title: t('proceso.step2_title'), desc: t('proceso.step2_desc') },
    { icon: 'fas fa-comments', title: t('proceso.step3_title'), desc: t('proceso.step3_desc') },
    { icon: 'fas fa-home', title: t('proceso.step4_title'), desc: t('proceso.step4_desc') }
  ];

  return (
    <section className="section proceso">
      <div className="container">
        <h2 className="section-title">{t('proceso.title')}</h2>
        <p className="section-subtitle">{t('proceso.subtitle')}</p>

        <div className="proceso-grid">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-icon">
                <i className={step.icon}></i>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link to="/mascotas" className="btn-primary">
            <i className="fas fa-paw me-2"></i>{t('proceso.btn_iniciar')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Proceso;