// src/pages/admin/rescates/RescatesShow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { getImageUrl } from '../../../utils/imageUtils';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Heart, 
  AlertCircle,
  FileText,
  Activity,
  Phone,
  Mail,
  ChevronLeft,
  Camera,
  XCircle,
  CheckCircle,
  Clock,
  Flag,
  ExternalLink,
  PawPrint,
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
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ✅ Función para obtener URL segura de imagen
  const getImageUrlSafe = useCallback((path) => {
    if (!path) return null;
    
    // Si ya es una URL completa de Cloudinary
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
      return path;
    }
    
    // Si es un path relativo, usar getImageUrl
    if (typeof path === 'string') {
      return getImageUrl(path);
    }
    
    return null;
  }, []);

  // ✅ Función para obtener todas las fotos del rescate
  const obtenerTodasLasFotos = useCallback((rescate) => {
    if (!rescate) return [];
    
    const fotos = [];
    
    // 1. Foto principal
    if (rescate.foto_principal) {
      const url = getImageUrlSafe(rescate.foto_principal);
      if (url) fotos.push(url);
    }
    
    // 2. Galería de fotos
    if (rescate.galeria_fotos) {
      try {
        let galeria = rescate.galeria_fotos;
        
        // Si es string, parsearlo
        if (typeof galeria === 'string') {
          galeria = JSON.parse(galeria);
        }
        
        // Asegurar que es un array
        if (!Array.isArray(galeria)) {
          galeria = [];
        }
        
        galeria.forEach((f) => {
          if (f) {
            const url = getImageUrlSafe(f);
            if (url) fotos.push(url);
          }
        });
      } catch (e) {
        console.error('Error procesando galería:', e);
      }
    }
    
    return fotos;
  }, [getImageUrlSafe]);

  // ✅ Memoizar las fotos
  const todasLasFotos = React.useMemo(() => {
    return obtenerTodasLasFotos(caso);
  }, [caso, obtenerTodasLasFotos]);

  // ✅ Actualizar foto seleccionada cuando cambien las fotos
  useEffect(() => {
    if (todasLasFotos.length > 0 && !fotoSeleccionada) {
      setFotoSeleccionada(todasLasFotos[0]);
    }
  }, [todasLasFotos, fotoSeleccionada]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchDetalleCaso = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateDetalleAdmin(id);
      
      console.log('📦 Respuesta admin:', response.data);
      
      if (response?.data?.success) {
        const data = response.data.data;
        
        console.log('📸 Datos del rescate admin:', {
          id: data.id,
          foto_principal: data.foto_principal,
          galeria_fotos: data.galeria_fotos,
        });
        
        // ✅ Procesar foto seleccionada
        let fotoSeleccionadaTemp = null;
        
        if (data.foto_principal) {
          fotoSeleccionadaTemp = getImageUrlSafe(data.foto_principal);
        } else if (data.galeria_fotos) {
          try {
            let galeria = data.galeria_fotos;
            if (typeof galeria === 'string') {
              galeria = JSON.parse(galeria);
            }
            if (Array.isArray(galeria) && galeria.length > 0) {
              fotoSeleccionadaTemp = getImageUrlSafe(galeria[0]);
            }
          } catch (e) {
            console.error('Error buscando foto en galería:', e);
          }
        }
        
        setFotoSeleccionada(fotoSeleccionadaTemp);
        setCaso(data);
        setError(null);
      } else {
        setError(response?.data?.message || t('errors.load_show_failed'));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.load_show_failed', 'No se pudo recuperar el historial del caso.'));
    } finally {
      setLoading(false);
    }
  }, [id, t, getImageUrlSafe]);

  useEffect(() => {
    if (id) fetchDetalleCaso();
  }, [id, fetchDetalleCaso]);

  const getBadgeEstado = (estado) => {
    const config = {
      pendiente: { class: 'rs-badge-danger', icon: Clock, label: 'Pendiente' },
      en_progreso: { class: 'rs-badge-warning', icon: Clock, label: 'En Progreso' },
      en_proceso: { class: 'rs-badge-warning', icon: Clock, label: 'En Progreso' },
      aprobado: { class: 'rs-badge-success', icon: CheckCircle, label: 'Aprobado' },
      completado: { class: 'rs-badge-success', icon: CheckCircle, label: 'Completado' },
      rechazado: { class: 'rs-badge-muted', icon: XCircle, label: 'Rechazado' }
    };
    
    const info = config[estado] || config.pendiente;
    const Icon = info.icon;
    
    return (
      <span className={`rs-status-badge ${info.class}`}>
        <Icon size={14} style={{ display: 'inline', marginRight: '6px' }} />
        {t(`estado_${estado}`, info.label)}
      </span>
    );
  };

  const getPrioridadClass = () => {
    switch (caso?.prioridad) {
      case 'alta': return 'rs-prioridad-alta';
      case 'media': return 'rs-prioridad-media';
      default: return 'rs-prioridad-baja';
    }
  };

  // ✅ Handlers para el modal
  const handleAbrirModal = useCallback((url) => {
    setFotoSeleccionada(url);
    setIsModalOpen(true);
  }, []);

  const handleCerrarModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleNavegarModal = useCallback((direccion) => {
    if (todasLasFotos.length === 0) return;
    
    const indexActual = todasLasFotos.indexOf(fotoSeleccionada);
    const nuevoIndex = (indexActual + direccion + todasLasFotos.length) % todasLasFotos.length;
    setFotoSeleccionada(todasLasFotos[nuevoIndex]);
  }, [todasLasFotos, fotoSeleccionada]);

  if (loading) {
    return (
      <div className="rs-container">
        <div className="rs-loading">
          <div className="rs-spinner"></div>
          <p>{t('cargando_detalle', 'Cargando detalles del caso...')}</p>
        </div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="rs-container">
        <div className="bento-container">
          <div className="rs-error">
            <AlertCircle size={48} className="rs-error-icon" />
            <h3>{t('error_carga', 'Error de Visualización')}</h3>
            <p>{error || t('caso_no_existe', 'El caso solicitado no existe.')}</p>
            <button onClick={handleGoBack} className="rs-btn-retry">
              <ArrowLeft size={18} /> {t('volver', 'Volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container">
      <div className="rs-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_show', {
              defaultValue: 'Caso #{{id}} - {{titulo}}',
              id: caso.id,
              titulo: caso.titulo || caso.lugar_rescate || 'Sin título',
            }),
            solicitudes: 1,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <header className="rs-show-header">
          <button onClick={handleGoBack} className="rs-btn-back">
            <ChevronLeft size={18} />
            {t('volver', 'Volver')}
          </button>
          <div className="rs-header-actions">
            <span className="rs-case-id">{t('caso_id', 'ID CASO')}: #{caso.id}</span>
            {getBadgeEstado(caso.estado)}
          </div>
        </header>

        <div className="rs-bento-grid">
          {/* ✅ MAIN INFO CON GALERÍA */}
          <div className="rs-card rs-main-info">
            {/* ✅ GALERÍA DE FOTOS */}
            <div className="rs-galeria-container">
              {todasLasFotos.length > 0 ? (
                <>
                  {/* Foto grande */}
                  <div 
                    className="rs-img-container"
                    onClick={() => handleAbrirModal(fotoSeleccionada || todasLasFotos[0])}
                  >
                    <img 
                      src={fotoSeleccionada || todasLasFotos[0]} 
                      alt={caso.titulo || caso.lugar_rescate} 
                      className="rs-animal-cover" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="rs-img-overlay">
                      <Camera size={20} />
                      <span>{t('click_para_ampliar', 'Click para ampliar')}</span>
                    </div>
                  </div>

                  {/* Miniaturas */}
                  {todasLasFotos.length > 1 && (
                    <div className="rs-miniaturas">
                      {todasLasFotos.map((url, index) => (
                        <div
                          key={index}
                          className={`rs-miniatura ${(fotoSeleccionada || todasLasFotos[0]) === url ? 'active' : ''}`}
                          onClick={() => setFotoSeleccionada(url)}
                        >
                          <img 
                            src={url} 
                            alt={`Foto ${index + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                          {(fotoSeleccionada || todasLasFotos[0]) === url && (
                            <div className="rs-miniatura-check">
                              <CheckCircle size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rs-no-img-placeholder">
                  <Heart size={48} />
                  <span>{t('sin_evidencia', 'Sin Evidencia Fotográfica')}</span>
                </div>
              )}
            </div>

            <div className="rs-info-body">
              <h2>{caso.titulo || caso.lugar_rescate}</h2>
              <div className="rs-meta-row">
                <div className="rs-meta-item">
                  <Calendar size={14} />
                  <span>{t('registrado', 'Registrado')}: {new Date(caso.created_at).toLocaleString()}</span>
                </div>
                <div className="rs-meta-item">
                  <MapPin size={14} />
                  <span>{caso.lugar_rescate || t('ubicacion.por_defecto', 'Popayán, Cauca')}</span>
                </div>
                {caso.prioridad && (
                  <div className={`rs-meta-item rs-prioridad ${getPrioridadClass()}`}>
                    <Flag size={14} />
                    <span>{t('prioridad', 'Prioridad')}: {t(`prioridad_${caso.prioridad}`) || caso.prioridad}</span>
                  </div>
                )}
                {caso.tipo_emergencia && (
                  <div className="rs-meta-item">
                    <PawPrint size={14} />
                    <span>{t(`btn_${caso.tipo_emergencia}`) || caso.tipo_emergencia}</span>
                  </div>
                )}
              </div>
              <p className="rs-description-text">{caso.descripcion_rescate || caso.descripcion}</p>
            </div>
          </div>

          {/* ACTORES INVOLUCRADOS */}
          <div className="rs-card rs-actors-card">
            <h3><User size={18} /> {t('actores_involucrados', 'Actores Involucrados')}</h3>
            
            <div className="rs-actor-item">
              <div className="rs-actor-avatar">👤</div>
              <div>
                <span className="rs-actor-role">{t('ciudadano_informante', 'Ciudadano Informante')}</span>
                <span className="rs-actor-name">{caso.nombre_reportante || t('anonimo', 'Anónimo')}</span>
                {caso.telefono_reportante && (
                  <span className="rs-actor-contact"><Phone size={12} /> {caso.telefono_reportante}</span>
                )}
                {caso.email_reportante && (
                  <span className="rs-actor-contact"><Mail size={12} /> {caso.email_reportante}</span>
                )}
              </div>
            </div>

            <hr className="rs-divider" />

            <div className="rs-actor-item">
              <div className="rs-actor-avatar rs-actor-foundation">🐾</div>
              <div>
                <span className="rs-actor-role">{t('fundacion_asignada', 'Fundación Asignada')}</span>
                <span className="rs-actor-name">
                  {caso.entidad_responsable?.nombre || caso.fundacion?.nombre || caso.fundacion_nombre || t('sin_asignar', 'Ninguna (Sin Asignar)')}
                </span>
                {caso.entidad_responsable?.telefono && (
                  <span className="rs-actor-contact"><Phone size={12} /> {caso.entidad_responsable.telefono}</span>
                )}
              </div>
            </div>
          </div>

          {/* DATOS DE AUDITORÍA */}
          <div className="rs-card rs-audit-card">
            <h3><Shield size={18} /> {t('datos_auditoria', 'Datos de Auditoría')}</h3>
            <ul className="rs-audit-list">
              <li>
                <FileText size={14} />
                <div>
                  <strong>{t('descripcion_completa', 'Descripción completa')}:</strong>
                  <p>{caso.descripcion_rescate || caso.descripcion || t('no_especificada', 'No especificada')}</p>
                </div>
              </li>
              <li>
                <MapPin size={14} />
                <div>
                  <strong>{t('geolocalizacion', 'Geolocalización')}:</strong>
                  <p>
                    {caso.lat && caso.lng 
                      ? `${parseFloat(caso.lat).toFixed(6)}, ${parseFloat(caso.lng).toFixed(6)}` 
                      : t('sin_coordenadas', 'Sin coordenadas GPS')}
                  </p>
                  {caso.lat && caso.lng && (
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${caso.lat}&mlon=${caso.lng}#map=15/${caso.lat}/${caso.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rs-map-link"
                    >
                      <ExternalLink size={12} /> {t('ver_mapa', 'Ver mapa')}
                    </a>
                  )}
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

      {/* ✅ MODAL PARA AMPLIAR FOTOS */}
      {isModalOpen && fotoSeleccionada && (
        <div className="rs-modal" onClick={handleCerrarModal}>
          <div className="rs-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="rs-modal-close" onClick={handleCerrarModal}>
              <XCircle size={28} />
            </button>
            
            {todasLasFotos.length > 1 && (
              <>
                <button 
                  className="rs-modal-nav rs-modal-nav-left"
                  onClick={(e) => { e.stopPropagation(); handleNavegarModal(-1); }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="rs-modal-nav rs-modal-nav-right"
                  onClick={(e) => { e.stopPropagation(); handleNavegarModal(1); }}
                >
                  <ArrowLeft size={32} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </>
            )}

            <img 
              src={fotoSeleccionada} 
              alt="Foto ampliada"
              className="rs-modal-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />

            {todasLasFotos.length > 1 && (
              <div className="rs-modal-counter">
                {todasLasFotos.indexOf(fotoSeleccionada) + 1} / {todasLasFotos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RescatesShow;