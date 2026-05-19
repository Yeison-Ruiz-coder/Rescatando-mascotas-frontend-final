// src/pages/fundacion/rescates/RescateDetalle.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
import Button from '../../../components/common/Button/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import styles from './RescateDetalle.module.css'; // ← Importar como módulo

const RescateDetalle = ({ tipoUsuario }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('rescate');
  const [rescate, setRescate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [fotoPrincipal, setFotoPrincipal] = useState(null);
  const [galeriaFotos, setGaleriaFotos] = useState([]);

  const fetchRescate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateById(id);
      if (response.data.success) {
        const data = response.data.data;
        setRescate(data);
        
        if (data.foto_principal) {
          setFotoPrincipal(data.foto_principal);
        }
        if (data.galeria_fotos) {
          try {
            const galeria = typeof data.galeria_fotos === 'string' 
              ? JSON.parse(data.galeria_fotos) 
              : data.galeria_fotos;
            setGaleriaFotos(galeria || []);
          } catch (e) {
            setGaleriaFotos([]);
          }
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || t('errors.general'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchRescate();
  }, [fetchRescate]);

  const handleAceptar = async () => {
    setAccionLoading(true);
    try {
      const response = await rescateService.aceptarRescate(id);
      if (response.data.success) {
        fetchRescate();
        alert(t('rescate_aceptado'));
      }
    } catch (err) {
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setAccionLoading(false);
    }
  };

  const handleRechazar = async () => {
    setAccionLoading(true);
    try {
      const response = await rescateService.rechazarRescate(id);
      if (response.data.success) {
        navigate(`/${tipoUsuario}/rescates/disponibles`);
      }
    } catch (err) {
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setAccionLoading(false);
    }
  };

  const handleRegistrarMascota = () => {
    const ruta = tipoUsuario ? `/${tipoUsuario}/mascotas/nueva` : '/fundacion/mascotas/nueva';
    navigate(`${ruta}?rescate_id=${id}`);
  };

  const getPrioridadClass = () => {
    switch (rescate?.prioridad) {
      case 'alta': return styles.rescateDfPrioridadAlta;
      case 'media': return styles.rescateDfPrioridadMedia;
      default: return styles.rescateDfPrioridadBaja;
    }
  };

  const getEstadoClass = () => {
    switch (rescate?.estado) {
      case 'pendiente': return styles.rescateDfEstadoPendiente;
      case 'en_proceso': return styles.rescateDfEstadoProceso;
      case 'completado': return styles.rescateDfEstadoCompletado;
      default: return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.rescateDfContainer}>
        <LoadingSpinner text={t('cargando_detalle')} />
      </div>
    );
  }

  if (error || !rescate) {
    return (
      <div className={styles.rescateDfContainer}>
        <div className={styles.rescateDfErrorCard}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('error_carga')}</h3>
          <p>{error || t('rescate_no_encontrado')}</p>
          <button onClick={() => navigate(-1)} className={styles.rescateDfBtnBack}>
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rescateDfContainer}>
      <div className={styles.rescateDfHeader}>
        <button onClick={() => navigate(-1)} className={styles.rescateDfBtnBack}>
          <i className="fas fa-arrow-left"></i> {t('volver')}
        </button>
        <h1>{t('detalle_rescate')}</h1>
      </div>

      <div className={styles.rescateDfCard}>
        <div className={styles.rescateDfBadges}>
          <span className={`${styles.rescateDfPrioridad} ${getPrioridadClass()}`}>
            <i className="fas fa-flag"></i> {t('prioridad_label')}: {t(`prioridad_${rescate.prioridad}`)}
          </span>
          <span className={`${styles.rescateDfEstado} ${getEstadoClass()}`}>
            <i className="fas fa-circle"></i> {t(`estado_${rescate.estado}`)}
          </span>
          <span className={styles.rescateDfTipo}>
            <i className="fas fa-tag"></i> {t(`btn_${rescate.tipo_emergencia || 'otro'}`)}
          </span>
        </div>

        {/* FOTO PRINCIPAL */}
        {fotoPrincipal && (
          <div className={styles.rescateDfFotoPrincipal}>
            <label><i className="fas fa-camera"></i> {t('foto_principal')}</label>
            <img 
              src={fotoPrincipal} 
              alt="Foto principal del rescate"
              className={styles.rescateDfFotoPrincipalImg}
              onClick={() => window.open(fotoPrincipal, '_blank')}
            />
          </div>
        )}

        {/* GALERÍA DE FOTOS */}
        {galeriaFotos.length > 0 && (
          <div className={styles.rescateDfGaleria}>
            <label><i className="fas fa-images"></i> {t('galeria_fotos')} ({galeriaFotos.length})</label>
            <div className={styles.rescateDfGaleriaGrid}>
              {galeriaFotos.map((foto, index) => (
                <img 
                  key={index}
                  src={foto} 
                  alt={`Foto ${index + 1}`}
                  className={styles.rescateDfGaleriaImg}
                  onClick={() => window.open(foto, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.rescateDfInfo}>
          <div className={styles.rescateDfInfoGroup}>
            <label><i className="fas fa-map-marker-alt"></i> {t('lugar_label')}</label>
            <p>{rescate.lugar_rescate}</p>
          </div>

          <div className={styles.rescateDfInfoGroup}>
            <label><i className="fas fa-calendar-alt"></i> {t('fecha_label')}</label>
            <p>{formatDate(rescate.fecha_rescate)}</p>
          </div>

          <div className={styles.rescateDfInfoGroup}>
            <label><i className="fas fa-file-alt"></i> {t('descripcion_label')}</label>
            <p>{rescate.descripcion_rescate}</p>
          </div>

          {/* Datos del reportante */}
          {(rescate.nombre_reportante || rescate.telefono_reportante || rescate.email_reportante) && (
            <div className={styles.rescateDfInfoGroup}>
              <label><i className="fas fa-user"></i> {t('reportado_por')}</label>
              <p>
                {rescate.nombre_reportante && <><strong>{rescate.nombre_reportante}</strong><br /></>}
                {rescate.telefono_reportante && <><i className="fas fa-phone"></i> {rescate.telefono_reportante}<br /></>}
                {rescate.email_reportante && <><i className="fas fa-envelope"></i> {rescate.email_reportante}</>}
              </p>
            </div>
          )}

          {/* Coordenadas */}
          {rescate.lat && rescate.lng && (
            <div className={styles.rescateDfInfoGroup}>
              <label><i className="fas fa-location-dot"></i> {t('coordenadas')}</label>
              <p>
                {parseFloat(rescate.lat).toFixed(6)}, {parseFloat(rescate.lng).toFixed(6)}
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${rescate.lat}&mlon=${rescate.lng}#map=15/${rescate.lat}/${rescate.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.rescateDfMapLink}
                >
                  <i className="fas fa-external-link-alt"></i> {t('ver_mapa')}
                </a>
              </p>
            </div>
          )}
        </div>

        <div className={styles.rescateDfActions}>
          {rescate.estado === 'pendiente' && (
            <>
              <Button onClick={handleAceptar} variant="primary" disabled={accionLoading}>
                {accionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                {t('aceptar_rescate')}
              </Button>
              <Button onClick={handleRechazar} variant="danger" disabled={accionLoading}>
                <i className="fas fa-times-circle"></i> {t('rechazar_rescate')}
              </Button>
            </>
          )}

          {rescate.estado === 'en_proceso' && (
            <Button onClick={handleRegistrarMascota} variant="primary">
              <i className="fas fa-paw"></i> {t('registrar_mascota')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescateDetalle;