// src/pages/fundacion/suscripciones/SuscripcionesShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import './SuscripcionesShow.css';

const FundacionSuscripcionesShow = () => {
  const { t } = useTranslation(['fundacion', 'suscripciones']);
  const { id } = useParams();
  const { user } = useAuth();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);

  const fundacionName = user?.nombre || user?.name || t('fundacion');
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getEntitySuscripcionById(id);
      setSuscripcion(data);
    } catch (error) {
      toast.error(t('error_cargar_suscripcion'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'estado-activo', icon: 'fa-check-circle', label: t('estado_activo') },
      pendiente: { class: 'estado-pendiente', icon: 'fa-clock', label: t('estado_pendiente') },
      pausado: { class: 'estado-pausado', icon: 'fa-pause-circle', label: t('estado_pausado') },
      cancelado: { class: 'estado-cancelado', icon: 'fa-times-circle', label: t('estado_cancelado') },
      finalizado: { class: 'estado-finalizado', icon: 'fa-flag-checkered', label: t('estado_finalizado') }
    };
    return config[estado] || config.cancelado;
  };

  const getFrecuenciaTexto = (frecuencia) => {
    const textos = {
      unica: t('frecuencia_unica'),
      mensual: t('frecuencia_mensual'),
      trimestral: t('frecuencia_trimestral'),
      anual: t('frecuencia_anual')
    };
    return textos[frecuencia] || frecuencia;
  };

  if (loading) {
    return (
      <div className="fs-show-page">
        <div className="fs-loading">
          <div className="spinner"></div>
          <p>{t('cargando')}</p>
        </div>
      </div>
    );
  }

  if (!suscripcion) {
    return (
      <div className="fs-show-page">
        <div className="fs-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('no_encontrada')}</h3>
          <p>{t('suscripcion_no_encontrada')}</p>
          <Link to="/fundacion/suscripciones" className="fs-btn-volver">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </Link>
        </div>
      </div>
    );
  }

  const estado = getEstadoBadge(suscripcion.estado);

  return (
    <div className="fs-show-page">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t('banner.titulo_detalle', {
            defaultValue: 'Suscripción #{{id}}',
            id: suscripcion.id
          }),
          solicitudes: 1,
          adopciones: 0,
          eventos: 0,
        }}
      />

      <div className="fs-show-wrapper">
        <div className="fs-show-header">
          <Link to="/fundacion/suscripciones" className="fs-btn-back">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </Link>
          <div className="fs-show-title">
            <h1>
              <i className="fas fa-hand-holding-heart"></i>
              {t('detalle_suscripcion')} {t('num', '#')}{suscripcion.id}
            </h1>
            <span className={`fs-estado-badge ${estado.class}`}>
              <i className={`fas ${estado.icon}`}></i> {estado.label}
            </span>
          </div>
        </div>

        <div className="fs-show-grid">
          {/* Información de la suscripción */}
          <div className="fs-show-card">
            <h3><i className="fas fa-info-circle"></i> {t('informacion_suscripcion')}</h3>
            <div className="fs-show-item">
              <span className="fs-show-label">{t('monto_mensual')}</span>
              <span className="fs-show-value">${parseFloat(suscripcion.monto_mensual || 0).toLocaleString()}</span>
            </div>
            <div className="fs-show-item">
              <span className="fs-show-label">{t('frecuencia')}</span>
              <span className="fs-show-value">{getFrecuenciaTexto(suscripcion.frecuencia)}</span>
            </div>
            <div className="fs-show-item">
              <span className="fs-show-label">{t('fecha_inicio')}</span>
              <span className="fs-show-value">{formatDate(suscripcion.fecha_inicio)}</span>
            </div>
            {suscripcion.fecha_fin && (
              <div className="fs-show-item">
                <span className="fs-show-label">{t('fecha_fin')}</span>
                <span className="fs-show-value">{formatDate(suscripcion.fecha_fin)}</span>
              </div>
            )}
            <div className="fs-show-item">
              <span className="fs-show-label">{t('es_demo')}</span>
              <span className="fs-show-value">{suscripcion.es_demo ? t('si') : t('no')}</span>
            </div>
          </div>

          {/* Información del donante */}
          <div className="fs-show-card">
            <h3><i className="fas fa-user"></i> {t('informacion_donante')}</h3>
            {suscripcion.user ? (
              <>
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('nombre')}</span>
                  <span className="fs-show-value">{suscripcion.user.name || suscripcion.user.nombre || t('no_disponible')}</span>
                </div>
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('email')}</span>
                  <span className="fs-show-value">
                    <a href={`mailto:${suscripcion.user.email}`}>{suscripcion.user.email || t('no_disponible')}</a>
                  </span>
                </div>
                {suscripcion.user.telefono && (
                  <div className="fs-show-item">
                    <span className="fs-show-label">{t('telefono')}</span>
                    <span className="fs-show-value">
                      <a href={`tel:${suscripcion.user.telefono}`}>{suscripcion.user.telefono}</a>
                    </span>
                  </div>
                )}
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('usuario_id')}</span>
                  <span className="fs-show-value">#{suscripcion.user_id}</span>
                </div>
              </>
            ) : (
              <p className="fs-no-info">{t('donante_no_disponible')}</p>
            )}
          </div>

          {/* Información de la mascota */}
          <div className="fs-show-card">
            <h3><i className="fas fa-paw"></i> {t('informacion_mascota')}</h3>
            {suscripcion.mascota ? (
              <>
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('nombre')}</span>
                  <span className="fs-show-value">{suscripcion.mascota.nombre || suscripcion.mascota.nombre_mascota || t('no_disponible')}</span>
                </div>
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('especie')}</span>
                  <span className="fs-show-value">{suscripcion.mascota.especie || t('no_disponible')}</span>
                </div>
                {suscripcion.mascota.raza && (
                  <div className="fs-show-item">
                    <span className="fs-show-label">{t('raza')}</span>
                    <span className="fs-show-value">{suscripcion.mascota.raza}</span>
                  </div>
                )}
                {suscripcion.mascota.edad && (
                  <div className="fs-show-item">
                    <span className="fs-show-label">{t('edad')}</span>
                    <span className="fs-show-value">{suscripcion.mascota.edad} {t('años')}</span>
                  </div>
                )}
                <div className="fs-show-item">
                  <span className="fs-show-label">{t('mascota_id')}</span>
                  <span className="fs-show-value">#{suscripcion.mascota_id}</span>
                </div>
              </>
            ) : (
              <p className="fs-no-info">{t('mascota_no_disponible')}</p>
            )}
          </div>

          {/* Mensaje de apoyo */}
          {suscripcion.mensaje_apoyo && (
            <div className="fs-show-card fs-show-card-full">
              <h3><i className="fas fa-comment-dots"></i> {t('mensaje_apoyo')}</h3>
              <p className="fs-mensaje-apoyo">"{suscripcion.mensaje_apoyo}"</p>
            </div>
          )}
        </div>

        <div className="fs-show-actions">
          <Link to="/fundacion/suscripciones" className="fs-btn-secondary">
            <i className="fas fa-arrow-left"></i> {t('volver_lista')}
          </Link>
          <button
            className="fs-btn-print"
            onClick={() => window.print()}
          >
            <i className="fas fa-print"></i> {t('imprimir')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundacionSuscripcionesShow;