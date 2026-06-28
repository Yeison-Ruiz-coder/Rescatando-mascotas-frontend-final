// src/pages/admin/rescates/RescatesShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Heart, 
  AlertCircle,
  FileText,
  Activity
} from 'lucide-react';
import './RescatesShow.css';

const RescatesShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const fetchDetalleCaso = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateDetalleAdmin(id);
      if (response.data.success) {
        setCaso(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.load_show_failed', 'No se pudo recuperar el historial del caso.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchDetalleCaso();
  }, [id, fetchDetalleCaso]);

  const getBadgeEstado = (estado) => {
    const clases = {
      pendiente: 'badge-danger',
      en_progreso: 'badge-warning',
      completado: 'badge-success',
      rechazado: 'badge-muted'
    };
    const labels = {
      pendiente: t('estado_pendiente', 'Pendiente'),
      en_progreso: t('estado_progreso', 'En Progreso'),
      completado: t('estado_completado', 'Completado'),
      rechazado: t('estado_rechazado', 'Rechazado')
    };
    return <span className={`ras-status-badge ${clases[estado] || 'badge-info'}`}>
      {labels[estado] || estado?.toUpperCase()}
    </span>;
  };

  if (loading) {
    return (
      <div className="ras-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_detalle', 'Cargando detalles del caso...')}</p>
        </div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="ras-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t('error_carga', 'Error de Visualización')}</h3>
            <p>{error || t('caso_no_existe', 'El caso solicitado no existe.')}</p>
            <button onClick={() => navigate('/admin/rescates')} className="btn-retry-modern">
              {t('volver_consola', 'Volver a Consola')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ras-container">
      <div className="ras-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_show', {
              defaultValue: 'Caso #{{id}} - {{titulo}}',
              id: caso.id,
              titulo: caso.titulo || 'Sin título',
            }),
            solicitudes: 1,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <header className="ras-show-header">
          <button onClick={() => navigate('/admin/rescates')} className="ras-btn-back">
            <ArrowLeft size={16} /> {t('volver_historial', 'Volver al Historial')}
          </button>
          <div className="ras-header-actions">
            <span className="ras-case-id">{t('caso_id', 'ID CASO')}: #{caso.id}</span>
            {getBadgeEstado(caso.estado)}
          </div>
        </header>

        <div className="ras-bento-grid">
          <div className="ras-card ras-main-info">
            <div className="ras-img-container">
              {caso.foto ? (
                <img src={caso.foto} alt={caso.titulo} className="ras-animal-cover" />
              ) : (
                <div className="ras-no-img-placeholder">
                  <Heart size={48} />
                  <span>{t('sin_evidencia', 'Sin Evidencia Fotográfica')}</span>
                </div>
              )}
            </div>
            <div className="ras-info-body">
              <h2>{caso.titulo}</h2>
              <div className="ras-meta-row">
                <div className="ras-meta-item">
                  <Calendar size={14} />
                  <span>{t('registrado', 'Registrado')}: {new Date(caso.created_at).toLocaleString()}</span>
                </div>
                <div className="ras-meta-item">
                  <MapPin size={14} />
                  <span>{caso.barrio || 'Popayán, Cauca'}</span>
                </div>
              </div>
              <p className="ras-description-text">{caso.descripcion}</p>
            </div>
          </div>

          <div className="ras-card ras-actors-card">
            <h3><User size={18} /> {t('actores_involucrados', 'Actores Involucrados')}</h3>
            <div className="ras-actor-item">
              <div className="actor-avatar-stub">👤</div>
              <div>
                <span className="actor-role">{t('ciudadano_informante', 'Ciudadano Informante')}</span>
                <span className="actor-name">{caso.usuario?.nombre || t('anonimo', 'Anónimo')}</span>
                <span className="actor-contact">{caso.usuario?.email || t('sin_contacto', 'Sin contacto directo')}</span>
              </div>
            </div>

            <hr className="ras-divider" />

            <div className="ras-actor-item">
              <div className="actor-avatar-stub foundation-stub">🐾</div>
              <div>
                <span className="actor-role">{t('fundacion_asignada', 'Fundación Asignada')}</span>
                <span className="actor-name">{caso.fundacion?.nombre || t('sin_asignar', 'Ninguna (Sin Asignar)')}</span>
                <span className="actor-contact">{caso.fundacion?.telefono || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="ras-card ras-audit-card">
            <h3><Shield size={18} /> {t('datos_auditoria', 'Datos de Auditoría')}</h3>
            <ul className="ras-audit-list">
              <li>
                <FileText size={14} />
                <div>
                  <strong>{t('direccion_descrita', 'Dirección exacta descrita')}:</strong>
                  <p>{caso.direccion || t('no_especificada', 'No especificada')}</p>
                </div>
              </li>
              <li>
                <MapPin size={14} />
                <div>
                  <strong>{t('geolocalizacion', 'Geolocalización (Lat, Long)')}:</strong>
                  <p>{caso.latitud && caso.longitud ? `${caso.latitud}, ${caso.longitud}` : t('sin_coordenadas', 'Sin coordenadas GPS')}</p>
                </div>
              </li>
              <li>
                <Activity size={14} />
                <div>
                  <strong>{t('historial_cambios', 'Historial de Cambios')}:</strong>
                  <p>{t('creado_actualizado', {
                    defaultValue: 'Caso creado el {{created}}. Última actualización el {{updated}}.',
                    created: new Date(caso.created_at).toLocaleDateString(),
                    updated: new Date(caso.updated_at || caso.created_at).toLocaleDateString()
                  })}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescatesShow;