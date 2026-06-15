// src/pages/public/Home/components/AliadosSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../../../services/api';
import './AliadosSection.css';

const AliadosSection = () => {
  const { t } = useTranslation('home');
  const [veterinarias, setVeterinarias] = useState([]);
  const [fundaciones, setFundaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAliados = async () => {
      try {
        const [vetsRes, fundsRes] = await Promise.all([
          api.get('/veterinarias', { params: { limit: 5 } }),
          api.get('/fundaciones', { params: { limit: 5 } })
        ]);

        let vetsData = [];
        if (vetsRes.data?.data?.data) vetsData = vetsRes.data.data.data;
        else if (vetsRes.data?.data) vetsData = vetsRes.data.data;
        else if (Array.isArray(vetsRes.data)) vetsData = vetsRes.data;
        
        const mappedVets = vetsData.slice(0, 5).map(vet => ({
          id: vet.id,
          nombre: vet.Nombre_vet || vet.nombre || 'Veterinaria',
          urgencias_24h: vet.urgencias_24h || false,
          verificado: vet.verificado || false,
          ciudad: vet.ciudad || vet.Direccion?.split(',')[0] || 'Ubicación no especificada'
        }));
        setVeterinarias(mappedVets);

        let fundsData = [];
        if (fundsRes.data?.data?.data) fundsData = fundsRes.data.data.data;
        else if (fundsRes.data?.data) fundsData = fundsRes.data.data;
        else if (Array.isArray(fundsRes.data)) fundsData = fundsRes.data;
        
        const mappedFunds = fundsData.slice(0, 5).map(fund => ({
          id: fund.id,
          nombre: fund.Nombre_1 || fund.nombre || 'Fundación',
          recibe_voluntarios: fund.recibe_voluntarios || false,
          total_rescatadas: fund.total_rescatadas || 0,
          ciudad: fund.ciudad || 'Ubicación no especificada'
        }));
        setFundaciones(mappedFunds);

      } catch (error) {
        console.error('Error fetching aliados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAliados();
  }, []);

  if (loading) {
    return (
      <section className="al-section">
        <div className="al-container">
          <div className="al-header">
            <div className="al-skeleton-title" style={{ width: '60%', height: '32px', margin: '0 auto 12px', background: 'linear-gradient(90deg, var(--color-border) 25%, var(--color-hover) 50%, var(--color-border) 75%)', backgroundSize: '200% 100%', animation: 'al-skeleton-loading 1.5s infinite', borderRadius: '8px' }} />
            <div className="al-skeleton-subtitle" style={{ width: '40%', height: '20px', margin: '0 auto', background: 'linear-gradient(90deg, var(--color-border) 25%, var(--color-hover) 50%, var(--color-border) 75%)', backgroundSize: '200% 100%', animation: 'al-skeleton-loading 1.5s infinite', borderRadius: '8px' }} />
          </div>
          <div className="al-skeleton">
            {[1, 2].map((i) => (
              <div key={i} className="al-skeleton-card">
                <div className="al-skeleton-header">
                  <div className="al-skeleton-icon"></div>
                  <div>
                    <div className="al-skeleton-title"></div>
                    <div className="al-skeleton-sub"></div>
                  </div>
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="al-skeleton-item">
                    <div className="al-skeleton-avatar"></div>
                    <div className="al-skeleton-text">
                      <div className="al-skeleton-name"></div>
                      <div className="al-skeleton-detail"></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (veterinarias.length === 0 && fundaciones.length === 0) return null;

  return (
    <section className="al-section">
      <div className="al-container">
        <div className="al-header reveal-up">
          <div className="al-icon-top">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h2 className="al-title">
            {t('aliados.titulo') || 'Ellos hacen posible el cambio'}
          </h2>
          <p className="al-subtitle">
            {t('aliados.subtitulo') || 'Veterinarias y fundaciones que trabajan incansablemente por el bienestar animal'}
          </p>
        </div>

        <div className="al-grid stagger-children">
          {/* Veterinarias Card */}
          <div className="al-card">
            <div className="al-card-header">
              <div className="al-card-icon" style={{ background: 'var(--gradient-primary)' }}>
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="al-card-title-wrapper">
                <h3 className="al-card-title">
                  {t('aliados.veterinarias') || 'Veterinarias aliadas'}
                </h3>
                <div className="al-card-sub">
                  {t('aliados.veterinarias_sub') || 'Cuidado y salud garantizada'}
                </div>
              </div>
            </div>

            {veterinarias.length > 0 ? (
              <>
                <ul className="al-list">
                  {veterinarias.map((vet) => (
                    <li key={vet.id} className="al-item">
                      <div className="al-item-avatar" style={{ background: 'var(--gradient-primary)' }}>
                        {vet.urgencias_24h ? <i className="fas fa-ambulance"></i> : <i className="fas fa-clinic-medical"></i>}
                      </div>
                      <div className="al-item-content">
                        <div className="al-item-name">
                          <span>{vet.nombre}</span>
                          <div className="al-item-details">
                            {vet.urgencias_24h && (
                              <span className="al-badge al-badge-urgencia">
                                <i className="fas fa-clock"></i> 24h
                              </span>
                            )}
                            {vet.verificado && (
                              <span className="al-badge al-badge-verificado">
                                <i className="fas fa-check-circle"></i> Verificado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="al-item-info">
                          <div className="al-item-location">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{vet.ciudad}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="al-card-footer">
                  <Link to="/veterinarias" className="al-link">
                    {t('aliados.ver_veterinarias') || 'Conocer todas las veterinarias'}
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="al-empty">
                <div className="al-empty-icon">
                  <i className="fas fa-smile-wink"></i>
                </div>
                <p>{t('aliados.sin_veterinarias') || 'Pronto más veterinarias se unirán a esta causa'}</p>
              </div>
            )}
          </div>

          {/* Fundaciones Card */}
          <div className="al-card">
            <div className="al-card-header">
              <div className="al-card-icon" style={{ background: 'var(--gradient-accent)' }}>
                <i className="fas fa-hands-helping"></i>
              </div>
              <div className="al-card-title-wrapper">
                <h3 className="al-card-title">
                  {t('aliados.fundaciones') || 'Fundaciones colaboradoras'}
                </h3>
                <div className="al-card-sub">
                  {t('aliados.fundaciones_sub') || 'Rescatando y dando una segunda oportunidad'}
                </div>
              </div>
            </div>

            {fundaciones.length > 0 ? (
              <>
                <ul className="al-list">
                  {fundaciones.map((fund) => (
                    <li key={fund.id} className="al-item">
                      <div className="al-item-avatar" style={{ background: 'var(--gradient-accent)' }}>
                        <i className="fas fa-heart"></i>
                      </div>
                      <div className="al-item-content">
                        <div className="al-item-name">
                          <span>{fund.nombre}</span>
                          <div className="al-item-details">
                            {fund.recibe_voluntarios && (
                              <span className="al-badge al-badge-voluntarios">
                                <i className="fas fa-hands-helping"></i> Voluntarios
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="al-item-info">
                          {fund.total_rescatadas > 0 && (
                            <div className="al-item-stats">
                              <i className="fas fa-paw"></i>
                              <span>{fund.total_rescatadas} rescatados</span>
                            </div>
                          )}
                          {fund.ciudad && (
                            <div className="al-item-location">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{fund.ciudad}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="al-card-footer">
                  <Link to="/fundaciones" className="al-link">
                    {t('aliados.ver_fundaciones') || 'Conocer todas las fundaciones'}
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="al-empty">
                <div className="al-empty-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <p>{t('aliados.sin_fundaciones') || 'Pronto más fundaciones se unirán a esta causa'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="al-footer-message reveal-up delay-300">
          <span>
            <i className="fas fa-heartbeat"></i>
            {t('aliados.mensaje_footer') || 'Cada aliado es un paso más hacia un futuro mejor para los animales'}
            <i className="fas fa-heart" style={{ color: 'var(--color-heart)' }}></i>
          </span>
        </div>
      </div>
    </section>
  );
};

export default AliadosSection;