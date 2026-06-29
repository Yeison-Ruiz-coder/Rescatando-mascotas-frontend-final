// src/pages/admin/adopciones/AdopcionShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { getImageUrl } from '../../../utils/imageUtils';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Heart,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  ChevronLeft,
  PawPrint,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  MessageSquare
} from 'lucide-react';
import './AdopcionShow.css';

const AdopcionShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'mascotas']);
  const { user } = useAuth();

  const [adopcion, setAdopcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchAdopcion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/adopciones/${id}`, {
        params: {
          include: 'mascota,adoptante,seguimientos'
        }
      });

      if (response.data?.success) {
        setAdopcion(response.data.data);
      } else if (response.data?.data) {
        setAdopcion(response.data.data);
      } else {
        setError(t('admin:error_carga_adopcion', 'No se pudo cargar la adopción'));
      }
    } catch (err) {
      console.error('Error cargando adopción:', err);
      setError(err.response?.data?.message || t('admin:error_carga_adopcion'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchAdopcion();
  }, [id, fetchAdopcion]);

  const getEstadoBadge = (estado) => {
    const config = {
      'en_proceso': { class: 'as-badge-warning', icon: Clock, label: 'En proceso' },
      'en_progreso': { class: 'as-badge-warning', icon: Clock, label: 'En progreso' },
      'completada': { class: 'as-badge-success', icon: CheckCircle, label: 'Completada' },
      'aprobada': { class: 'as-badge-success', icon: CheckCircle, label: 'Aprobada' },
      'rechazada': { class: 'as-badge-danger', icon: XCircle, label: 'Rechazada' },
      'pendiente': { class: 'as-badge-muted', icon: Clock, label: 'Pendiente' }
    };
    const info = config[estado] || config.pendiente;
    const Icon = info.icon;
    return (
      <span className={`as-status-badge ${info.class}`}>
        <Icon size={14} style={{ display: 'inline', marginRight: '6px' }} />
        {info.label}
      </span>
    );
  };

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

  if (loading) {
    return (
      <div className="as-container">
        <div className="as-loading">
          <div className="as-spinner"></div>
          <p>{t('admin:cargando_adopcion', 'Cargando detalles de la adopción...')}</p>
        </div>
      </div>
    );
  }

  if (error || !adopcion) {
    return (
      <div className="as-container">
        <div className="bento-container">
          <div className="as-error">
            <AlertCircle size={48} className="as-error-icon" />
            <h3>{t('admin:error_carga', 'Error al cargar la adopción')}</h3>
            <p>{error || t('admin:adopcion_no_existe', 'La adopción solicitada no existe.')}</p>
            <button onClick={handleGoBack} className="as-btn-retry">
              <ArrowLeft size={18} /> {t('admin:volver', 'Volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container">
      <div className="as-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('admin:banner_adopcion_titulo', {
              defaultValue: 'Adopción #{{id}} - {{mascota}}',
              id: adopcion.id,
              mascota: adopcion.mascota?.nombre_mascota || 'Sin nombre',
            }),
            solicitudes: 1,
            adopciones: adopcion.estado === 'completada' ? 1 : 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <header className="as-show-header">
          <button onClick={handleGoBack} className="as-btn-back">
            <ChevronLeft size={18} />
            {t('admin:volver', 'Volver')}
          </button>
          <div className="as-header-actions">
            <span className="as-case-id">{t('admin:adopcion_id', 'ID ADOPCIÓN')}: #{adopcion.id}</span>
            {getEstadoBadge(adopcion.estado)}
          </div>
        </header>

        <div className="as-bento-grid">
          {/* MASCOTA */}
          <div className="as-card as-main-info">
            <div className="as-img-container">
              {adopcion.mascota?.foto_principal ? (
                <img
                  src={getImageUrl(adopcion.mascota.foto_principal)}
                  alt={adopcion.mascota.nombre_mascota}
                  className="as-animal-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="as-no-img-placeholder">
                  <PawPrint size={48} />
                  <span>{t('admin:sin_foto', 'Sin foto')}</span>
                </div>
              )}
            </div>

            <div className="as-info-body">
              <h2>{adopcion.mascota?.nombre_mascota || t('admin:sin_nombre', 'Sin nombre')}</h2>
              <div className="as-meta-row">
                <div className="as-meta-item">
                  <PawPrint size={14} />
                  <span>{adopcion.mascota?.especie || '-'}</span>
                </div>
                <div className="as-meta-item">
                  <User size={14} />
                  <span>{adopcion.mascota?.genero || '-'}</span>
                </div>
                <div className="as-meta-item">
                  <Calendar size={14} />
                  <span>{adopcion.mascota?.edad_aprox ? `${adopcion.mascota.edad_aprox} años` : '-'}</span>
                </div>
                {adopcion.mascota?.lugar_rescate && (
                  <div className="as-meta-item">
                    <MapPin size={14} />
                    <span>{adopcion.mascota.lugar_rescate}</span>
                  </div>
                )}
              </div>
              {adopcion.mascota?.descripcion && (
                <p className="as-description-text">{adopcion.mascota.descripcion}</p>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DE LA ADOPCIÓN */}
          <div className="as-card as-actors-card">
            <h3><Heart size={18} /> {t('admin:informacion_adopcion', 'Información de la adopción')}</h3>

            <div className="as-info-item">
              <div className="as-info-label">
                <Calendar size={14} />
                <span>{t('admin:fecha_adopcion', 'Fecha de adopción')}</span>
              </div>
              <div className="as-info-value">{formatDate(adopcion.fecha_adopcion) || '-'}</div>
            </div>

            {adopcion.observaciones && (
              <div className="as-info-item">
                <div className="as-info-label">
                  <MessageSquare size={14} />
                  <span>{t('admin:observaciones', 'Observaciones')}</span>
                </div>
                <div className="as-info-value">{adopcion.observaciones}</div>
              </div>
            )}

            {adopcion.motivo_rechazo && (
              <div className="as-info-item">
                <div className="as-info-label">
                  <XCircle size={14} style={{ color: '#ef4444' }} />
                  <span>{t('admin:motivo_rechazo', 'Motivo de rechazo')}</span>
                </div>
                <div className="as-info-value" style={{ color: '#ef4444' }}>{adopcion.motivo_rechazo}</div>
              </div>
            )}

            <hr className="as-divider" />

            <div className="as-info-item">
              <div className="as-info-label">
                <Clock size={14} />
                <span>{t('admin:creado', 'Creado')}</span>
              </div>
              <div className="as-info-value">{formatDate(adopcion.created_at)}</div>
            </div>

            <div className="as-info-item">
              <div className="as-info-label">
                <Clock size={14} />
                <span>{t('admin:actualizado', 'Actualizado')}</span>
              </div>
              <div className="as-info-value">{formatDate(adopcion.updated_at)}</div>
            </div>
          </div>

          {/* ADOPTANTE */}
          <div className="as-card as-audit-card">
            <h3><User size={18} /> {t('admin:adoptante', 'Adoptante')}</h3>

            {adopcion.adoptante ? (
              <>
                <div className="as-actor-item">
                  <div className="as-actor-avatar">👤</div>
                  <div>
                    <span className="as-actor-role">{t('admin:adoptante', 'Adoptante')}</span>
                    <span className="as-actor-name">{adopcion.adoptante.nombre || 'N/A'}</span>
                    {adopcion.adoptante.email && (
                      <span className="as-actor-contact"><Mail size={12} /> {adopcion.adoptante.email}</span>
                    )}
                    {adopcion.adoptante.telefono && (
                      <span className="as-actor-contact"><Phone size={12} /> {adopcion.adoptante.telefono}</span>
                    )}
                    {adopcion.adoptante.direccion && (
                      <span className="as-actor-contact"><Home size={12} /> {adopcion.adoptante.direccion}</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="as-no-info">{t('admin:sin_informacion_adoptante', 'Sin información del adoptante')}</p>
            )}
          </div>
        </div>

        {/* SEGUIMIENTOS */}
        {adopcion.seguimientos && adopcion.seguimientos.length > 0 && (
          <div className="as-seguimientos-section">
            <h3><FileText size={18} /> {t('admin:seguimientos', 'Seguimientos')}</h3>
            <div className="as-seguimientos-list">
              {adopcion.seguimientos.map((seg) => (
                <div key={seg.id} className="as-seguimiento-item">
                  <div className="as-seguimiento-info">
                    <span className="as-seguimiento-fecha">
                      <Calendar size={14} /> {formatDate(seg.fecha_seguimiento)}
                    </span>
                    <span className="as-seguimiento-tipo">
                      {seg.tipo_seguimiento === 'virtual' ? '📱' :
                       seg.tipo_seguimiento === 'domiciliario' ? '🏠' : '📞'}
                      {seg.tipo_seguimiento}
                    </span>
                    <span className={`as-seguimiento-estado estado-${seg.estado_mascota || 'bueno'}`}>
                      {seg.estado_mascota || 'Bueno'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/adopciones/seguimientos/${seg.id}`)}
                    className="as-btn-ver"
                  >
                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdopcionShow;