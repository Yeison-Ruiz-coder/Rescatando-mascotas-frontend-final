// src/pages/public/Veterinarias/VeterinariaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Shield, Ambulance, Star, Stethoscope, Info, ExternalLink } from 'lucide-react';
import api from '../../../services/api';
import { SimpleLoadingBar } from '../../../components/common/ProgressBar/ProgressBar';
import './VeterinariaDetalle.css';

const VeterinariaDetalle = ({ veterinariaId, embed = false }) => {
  const { id: urlId } = useParams();
  const id = veterinariaId || urlId;
  const { t } = useTranslation('veterinarias');
  const [veterinaria, setVeterinaria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  const getImagenUrl = () => {
    if (!veterinaria) return 'https://placehold.co/800x450/667eea/FFFFFF?text=Veterinaria';
    return (
      veterinaria.imagen_portada ||
      veterinaria.imagen ||
      veterinaria.foto_principal ||
      veterinaria.imagenUrl ||
      'https://placehold.co/800x450/667eea/FFFFFF?text=Veterinaria'
    );
  };

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
      if (!id) return;
      
      setLoading(true);
      setLoadProgress(0);
      setError(null);
      
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);
      
      try {
        const response = await api.get(`/veterinarias/${id}`);
        let data = extractData(response.data);
        
        if (data && data.veterinaria) {
          data = data.veterinaria;
        }
        
        if (!data || Object.keys(data).length === 0) {
          setLoadProgress(100);
          setTimeout(() => {
            setError(t('no_encontrada'));
            setLoading(false);
          }, 300);
        } else {
          setLoadProgress(100);
          setTimeout(() => {
            setVeterinaria(data);
            setLoading(false);
          }, 300);
        }
      } catch (err) {
        console.error('Error cargando veterinaria:', err);
        setLoadProgress(100);
        setTimeout(() => {
          if (err.response?.status === 404) {
            setError(t('no_encontrada'));
          } else {
            setError(err.response?.data?.message || t('error_carga'));
          }
          setLoading(false);
        }, 300);
      } finally {
        clearInterval(progressInterval);
      }
    };

    loadVeterinaria();
  }, [id, t]);

  if (loading) {
    return (
      <SimpleLoadingBar 
        progress={loadProgress}
        height="12px"
        variant="gradient"
      />
    );
  }

  if (error || !veterinaria) {
    return (
      <div className="veterinarias-detalle-page">
        <div className="veterinarias-detalle-bento-grid">
          <div className="error-card">
            <MapPin size={48} />
            <h3>{error || t('no_encontrada')}</h3>
            <p>{t('error_mensaje')}</p>
            {!embed && <Link to="/veterinarias" className="back-link">← {t('volver')}</Link>}
          </div>
        </div>
      </div>
    );
  }

  const servicios = getServiciosList();
  const imageUrl = getImagenUrl();

  return (
    <div className="veterinarias-detalle-page">
      {/* Botón volver - solo visible en modo página completa */}
      {!embed && (
        <div className="veterinarias-detalle-back-outer">
          <Link to="/veterinarias" className="veterinarias-detalle-back-link">
            <ArrowLeft size={16} />
            <span>{t('volver')}</span>
          </Link>
        </div>
      )}

      {/* Bento Grid principal */}
      <div className="veterinarias-detalle-bento-grid">
        {/* Imagen - tarjeta compacta */}
        <div className="veterinarias-detalle-imagen-wrapper">
          <img 
            src={imageUrl} 
            alt={veterinaria.Nombre_vet} 
            className="veterinarias-detalle-imagen"
          />
        </div>

        {/* Sidebar - 4 columnas */}
        <div className="veterinarias-detalle-sidebar">
          {/* Contacto */}
          <div className="veterinarias-detalle-info-card">
            <div className="veterinarias-detalle-card-header">
              <Phone size={16} />
              <h3>{t('contacto')}</h3>
            </div>
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

          {/* Horario */}
          <div className="veterinarias-detalle-info-card">
            <div className="veterinarias-detalle-card-header">
              <Clock size={16} />
              <h3>{t('horario')}</h3>
            </div>
            <div className="veterinarias-detalle-field">
              <label>{t('atencion')}</label>
              <p>{getHorario()}</p>
            </div>
          </div>

          {/* Badges */}
          {(veterinaria.urgencias_24h || veterinaria.verificado || veterinaria.acepta_seguros) && (
            <div className="veterinarias-detalle-info-card">
              <div className="veterinarias-detalle-card-header">
                <Shield size={16} />
                <h3>{t('servicios_destacados')}</h3>
              </div>
              <div className="veterinarias-detalle-header-badges">
                {veterinaria.urgencias_24h && (
                  <span className="veterinarias-detalle-badge veterinarias-detalle-badge-urgente">
                    <Ambulance size={12} />
                    {t('urgencias_24h')}
                  </span>
                )}
                {veterinaria.verificado && (
                  <span className="veterinarias-detalle-badge veterinarias-detalle-badge-verificado">
                    <Shield size={12} />
                    {t('verificado')}
                  </span>
                )}
                {veterinaria.acepta_seguros && (
                  <span className="veterinarias-detalle-badge veterinarias-detalle-badge-seguro">
                    <Shield size={12} />
                    {t('acepta_seguros')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Valoración */}
          {veterinaria.valoracion_promedio > 0 && (
            <div className="veterinarias-detalle-info-card">
              <div className="veterinarias-detalle-card-header">
                <Star size={16} />
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
        </div>

        {/* Contenido principal - 8 columnas */}
        <div className="veterinarias-detalle-main">
          <h1 className="veterinarias-detalle-titulo">{veterinaria.Nombre_vet}</h1>
          
          {veterinaria.descripcion && (
            <div className="veterinarias-detalle-descripcion">
              {veterinaria.descripcion}
            </div>
          )}

          {servicios.length > 0 && (
            <>
              <h3 className="veterinarias-detalle-card-header" style={{ marginBottom: '12px' }}>
                <Stethoscope size={18} />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{t('servicios')}</h3>
              </h3>
              <div className="veterinarias-detalle-servicios-grid">
                {servicios.map((servicio, index) => (
                  <span key={index} className="veterinarias-detalle-servicio-badge">
                    ✓ {servicio}
                  </span>
                ))}
              </div>
            </>
          )}

          {(veterinaria.anios_experiencia || veterinaria.equipo_medico) && (
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
          )}

          {veterinaria.Direccion && (
            <>
              <h3 className="veterinarias-detalle-card-header" style={{ marginBottom: '12px' }}>
                <MapPin size={18} />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{t('ubicacion')}</h3>
              </h3>
              <div className="veterinarias-detalle-mapa-container">
                <iframe
                  title={`Mapa de ${veterinaria.Nombre_vet}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(veterinaria.Direccion)}&output=embed`}
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: "8px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(veterinaria.Direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="veterinarias-detalle-mapa-link"
                >
                  <MapPin size={12} />
                  {t('abrir_maps')}
                  <ExternalLink size={10} />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="veterinarias-detalle-footer">
        <Clock size={14} />
        <small>{t('actualizado')}: {new Date(veterinaria.updated_at || Date.now()).toLocaleDateString()}</small>
      </div>
    </div>
  );
};

export default VeterinariaDetalle;