// src/pages/admin/rescates/RescatesShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
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
  
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetalleCaso = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateDetalleAdmin(id);
      if (response.data.success) {
        setCaso(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error cargando la auditoría del caso:', err);
      setError(t('errors.load_show_failed', 'No se pudo recuperar el historial clínico-administrativo del caso.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchDetalleCaso();
  }, [id, fetchDetalleCaso]);

  if (loading) {
    return (
      <div className="ras-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>Extrayendo folios y registros de auditoría...</p>
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
            <h3>Error de Visualización</h3>
            <p>{error || 'El caso solicitado no existe en el archivo maestro.'}</p>
            <button onClick={() => navigate('/admin/rescates')} className="btn-retry-modern">
              Volver a Consola
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper para renderizar badges estilizados de estado
  const getBadgeEstado = (estado) => {
    const clases = {
      pendiente: 'badge-danger',
      en_progreso: 'badge-warning',
      completado: 'badge-success',
      rechazado: 'badge-muted'
    };
    return <span className={`ras-status-badge ${clases[estado] || 'badge-info'}`}>{estado?.toUpperCase()}</span>;
  };

  return (
    <div className="ras-container">
      {/* ===== BARRA SUPERIOR ===== */}
      <header className="ras-show-header">
        <button onClick={() => navigate('/admin/rescates')} className="ras-btn-back">
          <ArrowLeft size={16} /> Volver al Historial General
        </button>
        <div className="ras-header-actions">
          <span className="ras-case-id">ID CASO: #{caso.id}</span>
          {getBadgeEstado(caso.estado)}
        </div>
      </header>

      {/* ===== BENTO GRID LAYOUT DETALLE ===== */}
      <div className="bento-container ras-bento-grid">
        
        {/* Bloque Izquierdo: Multimedia e Identidad del Reporte */}
        <div className="ras-card ras-main-info">
          <div className="ras-img-container">
            {caso.foto ? (
              <img src={caso.foto} alt={caso.titulo} className="ras-animal-cover" />
            ) : (
              <div className="ras-no-img-placeholder">
                <Heart size={48} />
                <span>Sin Evidencia Fotográfica Registrada</span>
              </div>
            )}
          </div>
          <div className="ras-info-body">
            <h2>{caso.titulo}</h2>
            <div className="ras-meta-row">
              <div className="ras-meta-item">
                <Calendar size={14} />
                <span>Registrado: {new Date(caso.created_at).toLocaleString()}</span>
              </div>
              <div className="ras-meta-item">
                <MapPin size={14} />
                <span>{caso.barrio || 'Popayán, Cauca'}</span>
              </div>
            </div>
            <p className="ras-description-text">{caso.descripcion}</p>
          </div>
        </div>

        {/* Bloque Derecho Superior: Ficha del Reportante y Entidad de Apoyo */}
        <div className="ras-card ras-actors-card">
          <h3><User size={18} /> Actores Involucrados</h3>
          <div className="ras-actor-item">
            <div className="actor-avatar-stub">👤</div>
            <div>
              <span className="actor-role">Ciudadano Informante</span>
              <span className="actor-name">{caso.usuario?.nombre || 'Anónimo / Ciudadanía'}</span>
              <span className="actor-contact">{caso.usuario?.email || 'Sin contacto directo'}</span>
            </div>
          </div>

          <hr className="ras-divider" />

          <div className="ras-actor-item">
            <div className="actor-avatar-stub foundation-stub">🐾</div>
            <div>
              <span className="actor-role">Fundación Asignada</span>
              <span className="actor-name">{caso.fundacion?.nombre || 'Ninguna (Caso Sin Asignar)'}</span>
              <span className="actor-contact">{caso.fundacion?.telefono || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Bloque Derecho Inferior: Bitácora Metadatos Técnicos */}
        <div className="ras-card ras-audit-card">
          <h3><Shield size={18} /> Datos Técnicos de Auditoría</h3>
          <ul className="ras-audit-list">
            <li>
              <FileText size={14} />
              <div>
                <strong>Dirección exacta descrita:</strong>
                <p>{caso.direccion || 'No especificada'}</p>
              </div>
            </li>
            <li>
              <MapPin size={14} />
              <div>
                <strong>Geolocalización (Lat, Long):</strong>
                <p>{caso.latitud && caso.longitud ? `${caso.latitud}, ${caso.longitud}` : 'Sin coordenadas GPS'}</p>
              </div>
            </li>
            <li>
              <Activity size={14} />
              <div>
                <strong>Historial de Cambios:</strong>
                <p>Caso creado el {new Date(caso.created_at).toLocaleDateString()}. Última actualización del registro el {new Date(caso.updated_at || caso.created_at).toLocaleDateString()}.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default RescatesShow;