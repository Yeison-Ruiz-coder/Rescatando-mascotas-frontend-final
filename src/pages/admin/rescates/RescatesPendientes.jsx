// src/pages/admin/rescates/RescatesPendientes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
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
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]); // Garantiza un array inicial seguro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Guarda el ID del rescate en proceso

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Servicio para obtener únicamente casos con estado 'pendiente'
      const response = await rescateService.getPendientesAdmin();
      
      if (response && response.data) {
        const respuestaApi = response.data;
        
        if (respuestaApi.success) {
          // Desenvolvemos de forma segura la paginación (.data.data) o el array directo (.data) de Laravel
          const dataExtraida = respuestaApi.data?.data || respuestaApi.data;
          
          if (Array.isArray(dataExtraida)) {
            setPendientes(dataExtraida);
          } else {
            console.warn("La estructura recibida en pendientes no es un Array válido:", dataExtraida);
            setPendientes([]);
          }
        } else {
          setError(respuestaApi.message || t('errors.load_pendientes', 'No se pudieron cargar las alertas pendientes.'));
        }
      }
    } catch (err) {
      console.error('Error al cargar rescates pendientes:', err);
      setError(t('errors.load_pendientes', 'No se pudieron cargar las alertas pendientes.'));
      setPendientes([]); // Fallback defensivo para que no rompa el .length o el .map
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  // Aprobar reporte y cambiar estado a 'disponible' o 'aprobado'
  const handleAprobar = async (id) => {
    if (!window.confirm('¿Confirmas que este reporte es válido y deseas publicarlo para las fundaciones?')) return;
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

  // Rechazar / Descartar reporte (Falsa alarma, datos erróneos)
  const handleRechazar = async (id) => {
    const motivo = window.prompt('Por favor, ingresa el motivo del rechazo (será enviado al ciudadano):');
    if (motivo === null) return; // Canceló el prompt
    
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
          <p>Cargando cola de revisión ciudadana...</p>
        </div>
      </div>
    );
  }

  // Obtenemos de forma segura el conteo de registros cuidando que siempre sea un Array
  const conteoPendientes = Array.isArray(pendientes) ? pendientes.length : 0;

  return (
    <div className="rap-container">
      {/* ===== CABECERA DE RETORNO ===== */}
      <div className="rap-back-header">
        <button onClick={() => navigate('/admin/rescates')} className="rap-btn-back">
          <ArrowLeft size={16} /> Volver a la Consola Principal
        </button>
      </div>

      <div className="bento-container">
        <div className="rap-title-block">
          <div className="rap-title-left">
            <AlertTriangle className="rap-icon-alert" size={28} />
            <div>
              <h2>Alertas por Evaluar</h2>
              <p>Revisa, aprueba o descarta los reportes de animales en situación de riesgo en Popayán.</p>
            </div>
          </div>
          <span className="rap-counter-badge">{conteoPendientes} Casos</span>
        </div>

        {error && <div className="rap-error-banner">{error}</div>}

        {/* ===== LISTADO DE REVISIÓN ===== */}
        {conteoPendientes === 0 ? (
          <div className="empty-state-modern border-dashed">
            <Clock size={48} className="empty-icon" />
            <h3>¡Bandeja limpia!</h3>
            <p>No tienes reportes ciudadanos pendientes de validación por el momento.</p>
          </div>
        ) : (
          <div className="rap-table-wrapper">
            <table className="rap-table">
              <thead>
                <tr>
                  <th>Animal / Reporte</th>
                  <th>Ubicación</th>
                  <th>Fecha de Ingreso</th>
                  <th>Detalles del Caso</th>
                  <th className="text-center">Acciones de Auditoría</th>
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
                          <div className="rap-animal-no-img">No foto</div>
                        )}
                        <div>
                          <span className="rap-animal-title">{rescate.titulo || 'Sin título'}</span>
                          <span className="rap-reporter">Por: {rescate.usuario?.nombre || rescate.usuario_reporto?.nombre || 'Anónimo'}</span>
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
                      <div className="rap-icon-text truncate-parent">
                        <MessageSquare size={14} className="flex-shrink-0" />
                        <p className="rap-desc-text">{rescate.descripcion || 'Sin descripción.'}</p>
                      </div>
                    </td>
                    <td>
                      <div className="rap-actions-cell">
                        <button 
                          onClick={() => navigate(`/admin/rescates/show/${rescate.id}`)}
                          className="rap-action-btn btn-view"
                          title="Inspeccionar a fondo"
                          disabled={actionLoading !== null}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleAprobar(rescate.id)}
                          className="rap-action-btn btn-approve"
                          title="Validar y Publicar"
                          disabled={actionLoading !== null}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleRechazar(rescate.id)}
                          className="rap-action-btn btn-reject"
                          title="Descartar reporte"
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