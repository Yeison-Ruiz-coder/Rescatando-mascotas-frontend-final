// src/pages/admin/adopciones/SeguimientoShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { getImageUrl } from '../../../utils/imageUtils';
import {
  ArrowLeft,
  Calendar,
  User,
  AlertCircle,
  FileText,
  ChevronLeft,
  PawPrint,
  CheckCircle,
  Clock,
  Home,
  MessageSquare,
  Camera,
  Lightbulb,
  Heart
} from 'lucide-react';
import './SeguimientoShow.css';

const SeguimientoShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'mascotas']);
  const { user } = useAuth();

  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotos, setFotos] = useState([]);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchSeguimiento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/adopciones/seguimientos/${id}`, {
        params: {
          include: 'adopcion,mascota,adoptante'
        }
      });

      if (response.data?.success) {
        const data = response.data.data;
        setSeguimiento(data);

        // Procesar fotos adicionales
        if (data.fotos_adicionales) {
          try {
            const fotosData = typeof data.fotos_adicionales === 'string'
              ? JSON.parse(data.fotos_adicionales)
              : data.fotos_adicionales;
            setFotos(Array.isArray(fotosData) ? fotosData : []);
          } catch (e) {
            setFotos([]);
          }
        }
      } else if (response.data?.data) {
        setSeguimiento(response.data.data);
      } else {
        setError(t('admin:error_carga_seguimiento', 'No se pudo cargar el seguimiento'));
      }
    } catch (err) {
      console.error('Error cargando seguimiento:', err);
      setError(err.response?.data?.message || t('admin:error_carga_seguimiento'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchSeguimiento();
  }, [id, fetchSeguimiento]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const config = {
      excelente: { class: 'ss-badge-success', label: 'Excelente' },
      bueno: { class: 'ss-badge-info', label: 'Bueno' },
      regular: { class: 'ss-badge-warning', label: 'Regular' },
      preocupante: { class: 'ss-badge-danger', label: 'Preocupante' }
    };
    const info = config[estado] || config.bueno;
    return (
      <span className={`ss-status-badge ${info.class}`}>
        {info.label}
      </span>
    );
  };

  const getResultadoBadge = (resultado) => {
    const config = {
      satisfactorio: { class: 'ss-badge-success', label: 'Satisfactorio' },
      observaciones: { class: 'ss-badge-warning', label: 'Con observaciones' },
      incumplimiento: { class: 'ss-badge-danger', label: 'Incumplimiento' },
      reingreso: { class: 'ss-badge-info', label: 'Reingreso' }
    };
    const info = config[resultado] || config.satisfactorio;
    return (
      <span className={`ss-status-badge ${info.class}`}>
        {info.label}
      </span>
    );
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      virtual: '📱',
      domiciliario: '🏠',
      telefonico: '📞'
    };
    return icons[tipo] || '📋';
  };

  if (loading) {
    return (
      <div className="ss-container">
        <div className="ss-loading">
          <div className="ss-spinner"></div>
          <p>{t('admin:cargando_seguimiento', 'Cargando detalles del seguimiento...')}</p>
        </div>
      </div>
    );
  }

  if (error || !seguimiento) {
    return (
      <div className="ss-container">
        <div className="bento-container">
          <div className="ss-error">
            <AlertCircle size={48} className="ss-error-icon" />
            <h3>{t('admin:error_carga', 'Error al cargar el seguimiento')}</h3>
            <p>{error || t('admin:seguimiento_no_existe', 'El seguimiento solicitado no existe.')}</p>
            <button onClick={handleGoBack} className="ss-btn-retry">
              <ArrowLeft size={18} /> {t('admin:volver', 'Volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-container">
      <div className="ss-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('admin:banner_seguimiento_titulo', {
              defaultValue: 'Seguimiento #{{id}} - {{mascota}}',
              id: seguimiento.id,
              mascota: seguimiento.mascota?.nombre_mascota || seguimiento.adopcion?.mascota?.nombre_mascota || 'Sin nombre',
            }),
            solicitudes: 1,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <header className="ss-show-header">
          <button onClick={handleGoBack} className="ss-btn-back">
            <ChevronLeft size={18} />
            {t('admin:volver', 'Volver')}
          </button>
          <div className="ss-header-actions">
            <span className="ss-case-id">{t('admin:seguimiento_id', 'ID SEGUIMIENTO')}: #{seguimiento.id}</span>
            {getEstadoBadge(seguimiento.estado_mascota)}
            {seguimiento.resultado && getResultadoBadge(seguimiento.resultado)}
          </div>
        </header>

        <div className="ss-bento-grid">
          {/* INFORMACIÓN GENERAL */}
          <div className="ss-card ss-main-info">
            <h3><FileText size={18} /> {t('admin:informacion_general', 'Información general')}</h3>

            <div className="ss-info-grid">
              <div className="ss-info-item">
                <div className="ss-info-label">
                  <Calendar size={14} />
                  <span>{t('admin:fecha_seguimiento', 'Fecha de seguimiento')}</span>
                </div>
                <div className="ss-info-value">{formatDate(seguimiento.fecha_seguimiento)}</div>
              </div>

              <div className="ss-info-item">
                <div className="ss-info-label">
                  <User size={14} />
                  <span>{t('admin:tipo_seguimiento', 'Tipo de seguimiento')}</span>
                </div>
                <div className="ss-info-value">
                  {getTipoIcon(seguimiento.tipo_seguimiento)} {seguimiento.tipo_seguimiento || '-'}
                </div>
              </div>

              {seguimiento.realizado_por_nombre && (
                <div className="ss-info-item">
                  <div className="ss-info-label">
                    <User size={14} />
                    <span>{t('admin:realizado_por', 'Realizado por')}</span>
                  </div>
                  <div className="ss-info-value">{seguimiento.realizado_por_nombre}</div>
                </div>
              )}

              {seguimiento.proximo_seguimiento && (
                <div className="ss-info-item">
                  <div className="ss-info-label">
                    <Clock size={14} />
                    <span>{t('admin:proximo_seguimiento', 'Próximo seguimiento')}</span>
                  </div>
                  <div className="ss-info-value">{formatDate(seguimiento.proximo_seguimiento)}</div>
                </div>
              )}
            </div>
          </div>

          {/* MASCOTA Y ADOPTANTE */}
          <div className="ss-card">
            <h3><Heart size={18} /> {t('admin:mascota_adoptante', 'Mascota y adoptante')}</h3>

            <div className="ss-info-item">
              <div className="ss-info-label">
                <PawPrint size={14} />
                <span>{t('admin:mascota', 'Mascota')}</span>
              </div>
              <div className="ss-info-value">
                {seguimiento.mascota?.nombre_mascota || seguimiento.adopcion?.mascota?.nombre_mascota || '-'}
                {seguimiento.mascota?.especie && ` (${seguimiento.mascota.especie})`}
              </div>
            </div>

            <div className="ss-info-item">
              <div className="ss-info-label">
                <User size={14} />
                <span>{t('admin:adoptante', 'Adoptante')}</span>
              </div>
              <div className="ss-info-value">
                {seguimiento.adoptante?.nombre || seguimiento.adopcion?.adoptante?.nombre || '-'}
              </div>
            </div>

            {seguimiento.adoptante?.telefono && (
              <div className="ss-info-item">
                <div className="ss-info-label">
                  <User size={14} />
                  <span>{t('admin:telefono', 'Teléfono')}</span>
                </div>
                <div className="ss-info-value">{seguimiento.adoptante.telefono}</div>
              </div>
            )}

            <button
              onClick={() => navigate(`/admin/adopciones/${seguimiento.adopcion_id}`)}
              className="ss-btn-ver-adopcion"
            >
              <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              {t('admin:ver_adopcion', 'Ver adopción')}
            </button>
          </div>

          {/* CONDICIONES DEL HOGAR */}
          <div className="ss-card">
            <h3><Home size={18} /> {t('admin:condiciones_hogar', 'Condiciones del hogar')}</h3>

            {seguimiento.condiciones_hogar ? (
              <>
                <div className="ss-info-item">
                  <div className="ss-info-label">
                    <Home size={14} />
                    <span>{t('admin:condiciones', 'Condiciones')}</span>
                  </div>
                  <div className="ss-info-value">
                    {t(`admin:condicion_${seguimiento.condiciones_hogar}`, seguimiento.condiciones_hogar)}
                  </div>
                </div>

                {seguimiento.observaciones_hogar && (
                  <div className="ss-info-item">
                    <div className="ss-info-label">
                      <MessageSquare size={14} />
                      <span>{t('admin:observaciones_hogar', 'Observaciones del hogar')}</span>
                    </div>
                    <div className="ss-info-value">{seguimiento.observaciones_hogar}</div>
                  </div>
                )}

                <div className="ss-info-item">
                  <div className="ss-info-label">
                    <PawPrint size={14} />
                    <span>{t('admin:convive_con_otros_animales', 'Convive con otros animales')}</span>
                  </div>
                  <div className="ss-info-value">
                    {seguimiento.convive_con_otros_animales ? '✅ Sí' : '❌ No'}
                  </div>
                </div>
              </>
            ) : (
              <p className="ss-no-info">{t('admin:sin_informacion_hogar', 'Sin información del hogar')}</p>
            )}
          </div>

          {/* OBSERVACIONES */}
          {seguimiento.observaciones && (
            <div className="ss-card ss-card-full">
              <h3><MessageSquare size={18} /> {t('admin:observaciones', 'Observaciones')}</h3>
              <p className="ss-text-content">{seguimiento.observaciones}</p>
            </div>
          )}

          {/* RECOMENDACIONES */}
          {seguimiento.recomendaciones && (
            <div className="ss-card ss-card-full">
              <h3><Lightbulb size={18} /> {t('admin:recomendaciones', 'Recomendaciones')}</h3>
              <p className="ss-text-content">{seguimiento.recomendaciones}</p>
            </div>
          )}

          {/* COMPORTAMIENTO OBSERVADO */}
          {seguimiento.comportamiento_observado && (
            <div className="ss-card ss-card-full">
              <h3><PawPrint size={18} /> {t('admin:comportamiento_observado', 'Comportamiento observado')}</h3>
              <p className="ss-text-content">{seguimiento.comportamiento_observado}</p>
            </div>
          )}

          {/* FOTOS */}
          {seguimiento.foto_url && (
            <div className="ss-card ss-card-full">
              <h3><Camera size={18} /> {t('admin:foto_principal', 'Foto principal')}</h3>
              <img
                src={getImageUrl(seguimiento.foto_url)}
                alt="Foto principal"
                className="ss-foto-principal"
                onClick={() => window.open(getImageUrl(seguimiento.foto_url), '_blank')}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          )}

          {fotos.length > 0 && (
            <div className="ss-card ss-card-full">
              <h3><Camera size={18} /> {t('admin:fotos_adicionales', 'Fotos adicionales')}</h3>
              <div className="ss-fotos-grid">
                {fotos.map((foto, index) => (
                  <img
                    key={index}
                    src={getImageUrl(foto)}
                    alt={`Foto ${index + 1}`}
                    className="ss-foto"
                    onClick={() => window.open(getImageUrl(foto), '_blank')}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeguimientoShow;