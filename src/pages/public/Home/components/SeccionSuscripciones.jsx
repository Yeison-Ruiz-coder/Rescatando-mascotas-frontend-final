// src/pages/public/Home/components/SeccionSuscripciones.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../../../services/api';
import './SeccionSuscripciones.css';

const SeccionSuscripciones = () => {
  const { t } = useTranslation('home');
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const response = await api.get('/suscripciones/planes');
        let data = [];
        if (response.data?.data) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
        setPlanes(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching planes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, []);

  return (
    <section className="ss-suscripciones-section">
      <div className="hp-section-container">
        <h2 className="hp-section-title hp-reveal">
          {t('suscripciones.titulo') || 'Apadrina o Dona'}
        </h2>
        <p className="hp-section-subtitle hp-reveal hp-delay-100">
          {t('suscripciones.subtitulo') || 'Con tu ayuda podemos seguir rescatando y dando hogar a más animales'}
        </p>

        <div className="ss-suscripciones-grid">
          {!loading && planes.length > 0 ? (
            planes.map((plan, index) => (
              <div 
                key={plan.id} 
                className={`ss-suscripcion-card ${plan.destacado ? 'ss-featured' : ''} hp-reveal hp-delay-${(index % 3) * 100}`}
              >
                <div className="ss-suscripcion-icon">
                  {index === 0 && '🐾'}
                  {index === 1 && '💝'}
                  {index === 2 && '🌟'}
                </div>
                <h3 className="ss-suscripcion-title">{plan.nombre}</h3>
                <div className="ss-suscripcion-price">
                  <span className="ss-amount">${plan.monto?.toLocaleString()}</span>
                  <span className="ss-period">/{plan.frecuencia || 'mes'}</span>
                </div>
                <p className="ss-suscripcion-description">{plan.descripcion}</p>
                <Link to="/suscripciones" className="ss-suscripcion-btn">
                  {t('suscripciones.btn') || 'Apadrinar ahora'} <i className="fas fa-heart"></i>
                </Link>
              </div>
            ))
          ) : (
            <>
              <div className="ss-suscripcion-card hp-reveal hp-delay-0">
                <div className="ss-suscripcion-icon">🐾</div>
                <h3 className="ss-suscripcion-title">{t('suscripciones.plan1.titulo') || 'Amigo Fiel'}</h3>
                <div className="ss-suscripcion-price">
                  <span className="ss-amount">$10.000</span>
                  <span className="ss-period">/mes</span>
                </div>
                <p className="ss-suscripcion-description">{t('suscripciones.plan1.desc') || 'Ayuda con alimentos y cuidados básicos'}</p>
                <Link to="/suscripciones" className="ss-suscripcion-btn">{t('suscripciones.btn') || 'Apadrinar ahora'} <i className="fas fa-heart"></i></Link>
              </div>
              <div className="ss-suscripcion-card ss-featured hp-reveal hp-delay-100">
                <div className="ss-suscripcion-icon">💝</div>
                <h3 className="ss-suscripcion-title">{t('suscripciones.plan2.titulo') || 'Superhéroe'}</h3>
                <div className="ss-suscripcion-price">
                  <span className="ss-amount">$25.000</span>
                  <span className="ss-period">/mes</span>
                </div>
                <p className="ss-suscripcion-description">{t('suscripciones.plan2.desc') || 'Cubre gastos veterinarios y rescates'}</p>
                <Link to="/suscripciones" className="ss-suscripcion-btn">{t('suscripciones.btn') || 'Apadrinar ahora'} <i className="fas fa-heart"></i></Link>
              </div>
              <div className="ss-suscripcion-card hp-reveal hp-delay-200">
                <div className="ss-suscripcion-icon">🌟</div>
                <h3 className="ss-suscripcion-title">{t('suscripciones.plan3.titulo') || 'Ángel Guardián'}</h3>
                <div className="ss-suscripcion-price">
                  <span className="ss-amount">$50.000</span>
                  <span className="ss-period">/mes</span>
                </div>
                <p className="ss-suscripcion-description">{t('suscripciones.plan3.desc') || 'Impacto directo en rescates y esterilizaciones'}</p>
                <Link to="/suscripciones" className="ss-suscripcion-btn">{t('suscripciones.btn') || 'Apadrinar ahora'} <i className="fas fa-heart"></i></Link>
              </div>
            </>
          )}
        </div>

        <div className="ss-suscripciones-footer">
          <Link to="/login" className="ss-suscripciones-login-link">
            <i className="fas fa-user"></i> {t('suscripciones.login_link') || '¿Ya tienes cuenta? Inicia sesión para apadrinar'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeccionSuscripciones;