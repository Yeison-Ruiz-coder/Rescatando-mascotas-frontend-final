// src/pages/fundacion/rescates/RescateDetalle.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
import Button from '../../../components/common/Button/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
// Eliminar import del modal
import './RescateDetalle.css';

const RescateDetalle = ({ tipoUsuario }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('rescate');
  const [rescate, setRescate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);
  // Eliminar estado modalOpen

  const fetchRescate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateById(id);
      if (response.data.success) {
        setRescate(response.data.data);
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

  // Nueva función: Redirigir a registro de mascotas
  const handleRegistrarMascota = () => {
    navigate(`/${tipoUsuario}/mascotas/nueva?rescate_id=${id}`);
  };

  const getPrioridadClass = () => {
    switch (rescate?.prioridad) {
      case 'alta': return 'prioridad-alta';
      case 'media': return 'prioridad-media';
      default: return 'prioridad-baja';
    }
  };

  const getEstadoClass = () => {
    switch (rescate?.estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'en_proceso': return 'estado-proceso';
      case 'completado': return 'estado-completado';
      default: return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rescate-detalle-container">
        <LoadingSpinner text={t('cargando_detalle')} />
      </div>
    );
  }

  if (error || !rescate) {
    return (
      <div className="rescate-detalle-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('error_carga')}</h3>
          <p>{error || t('rescate_no_encontrado')}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rescate-detalle-container">
      <div className="detalle-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> {t('volver')}
        </button>
        <h1>{t('detalle_rescate')}</h1>
      </div>

      <div className="detalle-card">
        <div className="detalle-badges">
          <span className={`detalle-prioridad ${getPrioridadClass()}`}>
            <i className="fas fa-flag"></i> {t('prioridad_label')}: {t(`prioridad_${rescate.prioridad}`)}
          </span>
          <span className={`detalle-estado ${getEstadoClass()}`}>
            <i className="fas fa-circle"></i> {t(`estado_${rescate.estado}`)}
          </span>
          <span className="detalle-tipo">
            <i className="fas fa-tag"></i> {t(`btn_${rescate.tipo_emergencia || 'otro'}`)}
          </span>
        </div>

        <div className="detalle-info">
          <div className="info-group">
            <label><i className="fas fa-map-marker-alt"></i> {t('lugar_label')}</label>
            <p>{rescate.lugar_rescate}</p>
          </div>

          <div className="info-group">
            <label><i className="fas fa-calendar-alt"></i> {t('fecha_label')}</label>
            <p>{formatDate(rescate.fecha_rescate)}</p>
          </div>

          <div className="info-group">
            <label><i className="fas fa-file-alt"></i> {t('descripcion_label')}</label>
            <p>{rescate.descripcion_rescate}</p>
          </div>

          {rescate.nombre_reportante && (
            <div className="info-group">
              <label><i className="fas fa-user"></i> {t('reportado_por')}</label>
              <p>
                {rescate.nombre_reportante}
                {rescate.telefono_reportante && <span> - 📞 {rescate.telefono_reportante}</span>}
                {rescate.email_reportante && <span> - ✉️ {rescate.email_reportante}</span>}
              </p>
            </div>
          )}

          {rescate.lat && rescate.lng && (
            <div className="info-group">
              <label><i className="fas fa-location-dot"></i> {t('coordenadas')}</label>
              <p>
                {parseFloat(rescate.lat).toFixed(6)}, {parseFloat(rescate.lng).toFixed(6)}
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${rescate.lat}&mlon=${rescate.lng}#map=15/${rescate.lat}/${rescate.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  <i className="fas fa-external-link-alt"></i> {t('ver_mapa')}
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="detalle-actions">
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

          <Button onClick={() => navigate(-1)} variant="secondary">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </Button>
        </div>
      </div>

      {/* Eliminar el modal */}
    </div>
  );
};

export default RescateDetalle;