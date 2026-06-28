// src/pages/admin/rescates/RescatesPendientes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  Clock, 
  MapPin, 
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import './RescatesPendientes.css';

const RescatesPendientes = () => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rescateService.getPendientesAdmin();
      
      if (response && response.data) {
        const respuestaApi = response.data;
        if (respuestaApi.success) {
          const dataExtraida = respuestaApi.data?.data || respuestaApi.data;
          if (Array.isArray(dataExtraida)) {
            setPendientes(dataExtraida);
          } else {
            setPendientes([]);
          }
        } else {
          setError(respuestaApi.message || t('errors.load_pendientes'));
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.load_pendientes'));
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const handleAprobar = async (id) => {
    if (!window.confirm(t('confirm_aprobar', '¿Confirmas que este reporte es válido?'))) return;
    try {
      setActionLoading(id);
      await rescateService.aprobarRescate(id);
      setPendientes(prev => Array.isArray(prev) ? prev.filter(item => item.id !== id) : []);
    } catch (err) {
      alert(t('errors.approve_failed', 'Error al aprobar el reporte.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt(t('motivo_rechazo', 'Por favor, ingresa el motivo del rechazo:'));
    if (motivo === null) return;
    
    try {
      setActionLoading(id);
      await rescateService.rechazarRescate(id, { motivo });
      setPendientes(prev => Array.isArray(prev) ? prev.filter(item => item.id !== id) : []);
    } catch (err) {
      alert(t('errors.reject_failed', 'Error al rechazar el reporte.'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="rap-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_pendientes', 'Cargando cola de revisión...')}</p>
        </div>
      </div>
    );
  }

  const conteoPendientes = Array.isArray(pendientes) ? pendientes.length : 0;

  return (
    <div className="rap-container">
      <div className="rap-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_pendientes', {
              defaultValue: '{{count}} alertas pendientes de revisión',
              count: conteoPendientes,
            }),
            solicitudes: conteoPendientes,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <div className="rap-back-header">
          <button onClick={() => navigate('/admin/rescates')} className="rap-btn-back">
            <ArrowLeft size={16} />
            {t('volver_consola', 'Volver a la Consola Principal')}
          </button>
        </div>

        <div className="rap-title-block">
          <div className="rap-title-left">
            <AlertTriangle className="rap-icon-alert" size={28} />
            <div>
              <h2>{t('alertas_evaluar', 'Alertas por Evaluar')}</h2>
              <p>{t('alertas_evaluar_desc', 'Revisa, aprueba o descarta los reportes de animales en situación de riesgo.')}</p>
            </div>
          </div>
          <span className="rap-counter-badge">{conteoPendientes} {t('casos', 'Casos')}</span>
        </div>

        {error && <div className="rap-error-banner">{error}</div>}

        {conteoPendientes === 0 ? (
          <div className="empty-state-modern border-dashed">
            <Clock size={48} className="empty-icon" />
            <h3>{t('bandeja_limpia', '¡Bandeja limpia!')}</h3>
            <p>{t('bandeja_limpia_desc', 'No tienes reportes ciudadanos pendientes de validación por el momento.')}</p>
          </div>
        ) : (
          <div className="rap-table-wrapper">
            <table className="rap-table">
              <thead>
                <tr>
                  <th>{t('animal_reporte', 'Animal / Reporte')}</th>
                  <th>{t('ubicacion', 'Ubicación')}</th>
                  <th>{t('fecha_ingreso', 'Fecha de Ingreso')}</th>
                  <th>{t('detalles_caso', 'Detalles del Caso')}</th>
                  <th className="text-center">{t('acciones', 'Acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pendientes) && pendientes.map((rescate) => (
                  <tr key={rescate.id} className={actionLoading === rescate.id ? 'row-loading' : ''}>
                    <td>
                      <div className="rap-animal-cell">
                        {rescate.foto || rescate.foto_principal ? (
                          <img 
                            src={rescate.foto || rescate.foto_principal} 
                            alt={rescate.titulo} 
                            className="rap-animal-img" 
                          />
                        ) : (
                          <div className="rap-animal-no-img">{t('sin_foto', 'Sin foto')}</div>
                        )}
                        <div>
                          <span className="rap-animal-title">{rescate.titulo || t('sin_titulo', 'Sin título')}</span>
                          <span className="rap-reporter">{t('por', 'Por')}: {rescate.usuario?.nombre || rescate.usuario_reporto?.nombre || t('anonimo', 'Anónimo')}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="rap-icon-text">
                        <MapPin size={14} />
                        <span>{rescate.barrio || rescate.direccion || 'Popayán'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rap-icon-text">
                        <Clock size={14} />
                        <span>{rescate.created_at ? new Date(rescate.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="rap-desc-cell">
                      <div className="rap-icon-text">
                        <MessageSquare size={14} />
                        <p className="rap-desc-text">{rescate.descripcion || t('sin_descripcion', 'Sin descripción.')}</p>
                      </div>
                    </td>
                    <td>
                      <div className="rap-actions-cell">
                        <button 
                          onClick={() => navigate(`/admin/rescates/show/${rescate.id}`)}
                          className="rap-action-btn btn-view"
                          title={t('inspeccionar', 'Inspeccionar')}
                          disabled={actionLoading !== null}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleAprobar(rescate.id)}
                          className="rap-action-btn btn-approve"
                          title={t('validar_publicar', 'Validar y Publicar')}
                          disabled={actionLoading !== null}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleRechazar(rescate.id)}
                          className="rap-action-btn btn-reject"
                          title={t('descartar', 'Descartar reporte')}
                          disabled={actionLoading !== null}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescatesPendientes;