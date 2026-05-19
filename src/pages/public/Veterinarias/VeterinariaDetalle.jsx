// src/pages/public/Veterinarias/VeterinariaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Shield, Ambulance, Star, Stethoscope, Info, ExternalLink } from 'lucide-react';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './VeterinariaDetalle.css';

const VeterinariaDetalle = () => {
  const { id } = useParams();
  const { t } = useTranslation('veterinarias');
  const [veterinaria, setVeterinaria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractData = (response) => {
    if (response?.data && !Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response[0];
    if (response?.data?.data && !Array.isArray(response.data.data)) return response.data.data;
    return response;
  };

  const getServiciosList = () => {
    if (!veterinaria) return [];
    
    let servicios = [];
    if (veterinaria.servicios) {
      if (typeof veterinaria.servicios === 'string') {
        try { servicios = JSON.parse(veterinaria.servicios); } catch { servicios = []; }
      } else if (Array.isArray(veterinaria.servicios)) {
        servicios = veterinaria.servicios;
      }
    }
    
    if (veterinaria.servicios_detallados) {
      let detallados = [];
      if (typeof veterinaria.servicios_detallados === 'string') {
        try { detallados = JSON.parse(veterinaria.servicios_detallados); } catch { detallados = []; }
      } else if (Array.isArray(veterinaria.servicios_detallados)) {
        detallados = veterinaria.servicios_detallados;
      }
      servicios = [...servicios, ...detallados];
    }
    
    return [...new Set(servicios)];
  };

  const getHorario = () => {
    if (!veterinaria) return null;
    if (veterinaria.horario_atencion) return veterinaria.horario_atencion;
    if (veterinaria.urgencias_24h) return t('horario_24h');
    return t('horario_consultar');
  };

  useEffect(() => {
    const loadVeterinaria = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/veterinarias/${id}`);
        let data = extractData(response.data);
        
        if (data && data.veterinaria) {
          data = data.veterinaria;
        }
        
        if (!data || Object.keys(data).length === 0) {
          setError(t('no_encontrada'));
        } else {
          setVeterinaria(data);
        }
      } catch (err) {
        console.error('Error cargando veterinaria:', err);
        if (err.response?.status === 404) {
          setError(t('no_encontrada'));
        } else {
          setError(err.response?.data?.message || t('error_carga'));
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) loadVeterinaria();
  }, [id, t]);

  if (loading) {
    return (
      <div className="veterinarias-detalle-page">
        <div className="veterinarias-detalle-loading">
          <LoadingSpinner text={t('cargando')} />
        </div>
      </div>
    );
  }

  if (error || !veterinaria) {
    return (
      <div className="veterinarias-detalle-page">
        <div className="veterinarias-detalle-container">
          <div className="veterinarias-detalle-error-card">
            <MapPin size={48} />
            <h3>{error || t('no_encontrada')}</h3>
            <p>{t('error_mensaje')}</p>
            <Link to="/veterinarias" className="back-link">
              ← {t('volver')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const servicios = getServiciosList();

  return (
    <div className="veterinarias-detalle-page">
      <div className="veterinarias-detalle-back-outer">
        <div className="veterinarias-detalle-container">
          <Link to="/veterinarias" className="veterinarias-detalle-back-link">
            <ArrowLeft size={16} />
            <span>{t('volver')}</span>
          </Link>
        </div>
      </div>

      <div className="veterinarias-detalle-container">
        <div className="veterinarias-detalle-main-card">
          <div className="veterinarias-detalle-card-content-wrapper">
            <div className="veterinarias-detalle-header">
              <h1>{veterinaria.Nombre_vet}</h1>
              <div className="veterinarias-detalle-header-info">
                {veterinaria.ciudad && (
                  <div className="veterinarias-detalle-ciudad">
                    <MapPin size={16} />
                    <span>{veterinaria.ciudad}</span>
                  </div>
                )}
                <div className="veterinarias-detalle-badges">
                  {veterinaria.urgencias_24h && (
                    <span className="veterinarias-detalle-badge veterinarias-detalle-badge-urgente">
                      <Ambulance size={14} />
                      {t('urgencias_24h')}
                    </span>
                  )}
                  {veterinaria.verificado && (
                    <span className="veterinarias-detalle-badge veterinarias-detalle-badge-verificado">
                      <Shield size={14} />
                      {t('verificado')}
                    </span>
                  )}
                  {veterinaria.acepta_seguros && (
                    <span className="veterinarias-detalle-badge veterinarias-detalle-badge-seguro">
                      <Shield size={14} />
                      {t('acepta_seguros')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="veterinarias-detalle-info-grid">
              <div className="veterinarias-detalle-info-card">
                <div className="veterinarias-detalle-card-header">
                  <Phone size={18} />
                  <h3>{t('contacto')}</h3>
                </div>
                <div className="veterinarias-detalle-card-content">
                  {veterinaria.Direccion && (
                    <div className="veterinarias-detalle-field">
                      <label>{t('direccion')}</label>
                      <p>{veterinaria.Direccion}</p>
                    </div>
                  )}
                  {veterinaria.Telefono && (
                    <div className="veterinarias-detalle-field">
                      <label>{t('telefono')}</label>
                      <p>{veterinaria.Telefono}</p>
                    </div>
                  )}
                  {veterinaria.Email && (
                    <div className="veterinarias-detalle-field">
                      <label>{t('email')}</label>
                      <p>{veterinaria.Email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="veterinarias-detalle-info-card">
                <div className="veterinarias-detalle-card-header">
                  <Clock size={18} />
                  <h3>{t('horario')}</h3>
                </div>
                <div className="veterinarias-detalle-card-content">
                  <div className="veterinarias-detalle-field">
                    <label>{t('atencion')}</label>
                    <p>{getHorario()}</p>
                  </div>
                </div>
              </div>
            </div>

            {veterinaria.descripcion && (
              <div className="veterinarias-detalle-section">
                <div className="veterinarias-detalle-section-header">
                  <Info size={18} />
                  <h3>{t('sobre_nosotros')}</h3>
                </div>
                <p className="veterinarias-detalle-descripcion-text">{veterinaria.descripcion}</p>
              </div>
            )}

            {servicios.length > 0 && (
              <div className="veterinarias-detalle-section">
                <div className="veterinarias-detalle-section-header">
                  <Stethoscope size={18} />
                  <h3>{t('servicios')}</h3>
                </div>
                <div className="veterinarias-detalle-servicios-grid">
                  {servicios.map((servicio, index) => (
                    <span key={index} className="veterinarias-detalle-servicio-badge">
                      ✓ {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(veterinaria.anios_experiencia || veterinaria.equipo_medico) && (
              <div className="veterinarias-detalle-section">
                <div className="veterinarias-detalle-section-header">
                  <Info size={18} />
                  <h3>{t('info_adicional')}</h3>
                </div>
                <div className="veterinarias-detalle-info-adicional">
                  {veterinaria.anios_experiencia && (
                    <div className="veterinarias-detalle-info-item">
                      <strong>{t('anios_experiencia')}:</strong>
                      <span>{veterinaria.anios_experiencia}</span>
                    </div>
                  )}
                  {veterinaria.equipo_medico && (
                    <div className="veterinarias-detalle-info-item">
                      <strong>{t('equipo_medico')}:</strong>
                      <span>{veterinaria.equipo_medico}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {veterinaria.Direccion && (
              <div className="veterinarias-detalle-section">
                <div className="veterinarias-detalle-section-header">
                  <MapPin size={18} />
                  <h3>{t('ubicacion')}</h3>
                </div>
                <div className="veterinarias-detalle-mapa-wrapper">
                  <div className="veterinarias-detalle-mapa-container">
                    <iframe
                      title={`Mapa de ${veterinaria.Nombre_vet}`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(veterinaria.Direccion)}&output=embed`}
                      width="100%"
                      height="280"
                      style={{ border: 0, borderRadius: "12px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="veterinarias-detalle-mapa-footer">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(veterinaria.Direccion)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="veterinarias-detalle-mapa-link"
                    >
                      <MapPin size={14} />
                      {t('abrir_maps')}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {veterinaria.valoracion_promedio > 0 && (
              <div className="veterinarias-detalle-valoracion">
                <div className="veterinarias-detalle-valoracion-header">
                  <Star size={18} />
                  <h3>{t('valoracion')}</h3>
                </div>
                <div className="veterinarias-detalle-rating">
                  <span className="veterinarias-detalle-rating-stars">
                    {'★'.repeat(Math.round(veterinaria.valoracion_promedio))}
                    {'☆'.repeat(5 - Math.round(veterinaria.valoracion_promedio))}
                  </span>
                  <span className="veterinarias-detalle-rating-number">{veterinaria.valoracion_promedio}/5</span>
                  <span className="veterinarias-detalle-rating-count">
                    ({veterinaria.total_valoraciones || 0} {t('valoraciones')})
                  </span>
                </div>
              </div>
            )}

            <div className="veterinarias-detalle-footer">
              <small>
                {t('actualizado')}: {new Date(veterinaria.updated_at || Date.now()).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinariaDetalle;