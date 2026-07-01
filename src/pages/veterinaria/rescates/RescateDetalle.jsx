// src/pages/fundacion/rescates/RescateDetalle.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Camera,
  Images,
  Flag,
  Tag,
  PawPrint,
  ExternalLink,
  Loader2,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUtils';
import './RescateDetalle.css';

const RescateDetalle = ({ tipoUsuario = 'fundacion' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const [rescate, setRescate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [fotoPrincipal, setFotoPrincipal] = useState(null);
  const [galeriaFotos, setGaleriaFotos] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== BANNER DATA =====
  const fundacionName = user?.name || user?.nombre || t('fundacion', 'Fundación');
  const fundacionAvatar = user?.avatar || null;

  const fetchRescate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getRescateById(id);
      if (response.data.success) {
        const data = response.data.data;
        setRescate(data);
        
        if (data.foto_principal) {
          const url = getImageUrl(data.foto_principal);
          setFotoPrincipal(url);
          setFotoSeleccionada(url);
        }
        if (data.galeria_fotos) {
          try {
            const galeria = typeof data.galeria_fotos === 'string' 
              ? JSON.parse(data.galeria_fotos) 
              : data.galeria_fotos;
            const urls = galeria.map(f => getImageUrl(f));
            setGaleriaFotos(urls);
            // Si no hay foto principal, usar la primera de la galería
            if (!data.foto_principal && urls.length > 0) {
              setFotoSeleccionada(urls[0]);
            }
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

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSeleccionarFoto = (url) => {
    setFotoSeleccionada(url);
  };

  const handleAbrirModal = (url) => {
    setFotoSeleccionada(url);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
  };

  const handleNavegarModal = (direccion) => {
    const todasLasFotos = fotoPrincipal ? [fotoPrincipal, ...galeriaFotos] : galeriaFotos;
    const indexActual = todasLasFotos.indexOf(fotoSeleccionada);
    let nuevoIndex = indexActual + direccion;
    if (nuevoIndex < 0) nuevoIndex = todasLasFotos.length - 1;
    if (nuevoIndex >= todasLasFotos.length) nuevoIndex = 0;
    setFotoSeleccionada(todasLasFotos[nuevoIndex]);
  };

  const getPrioridadClass = () => {
    switch (rescate?.prioridad) {
      case 'alta': return 'rd-detalle-prioridad-alta';
      case 'media': return 'rd-detalle-prioridad-media';
      default: return 'rd-detalle-prioridad-baja';
    }
  };

  const getPrioridadIcon = () => {
    switch (rescate?.prioridad) {
      case 'alta': return <Flag size={16} />;
      case 'media': return <Clock size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  const getEstadoClass = () => {
    switch (rescate?.estado) {
      case 'pendiente': return 'rd-detalle-estado-pendiente';
      case 'en_proceso': return 'rd-detalle-estado-proceso';
      case 'completado': return 'rd-detalle-estado-completado';
      case 'rechazado': return 'rd-detalle-estado-rechazado';
      default: return '';
    }
  };

  const getEstadoIcon = () => {
    switch (rescate?.estado) {
      case 'pendiente': return <Clock size={16} />;
      case 'en_proceso': return <Loader2 size={16} className="spin" />;
      case 'completado': return <CheckCircle size={16} />;
      case 'rechazado': return <XCircle size={16} />;
      default: return null;
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

  // ===== OBTENER TODAS LAS FOTOS =====
  const todasLasFotos = fotoPrincipal ? [fotoPrincipal, ...galeriaFotos] : galeriaFotos;

  if (loading) {
    return (
      <div className="rd-detalle-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_detalle', 'Cargando detalle del rescate...')}</p>
        </div>
      </div>
    );
  }

  if (error || !rescate) {
    return (
      <div className="rd-detalle-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t('error_carga', 'Error al cargar el rescate')}</h3>
            <p>{error || t('rescate_no_encontrado', 'Rescate no encontrado')}</p>
            <button onClick={handleVolver} className="btn-retry-modern">
              <ArrowLeft size={18} /> {t('volver', 'Volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rd-detalle-container">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="rd-detalle-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: fundacionName,
            avatar: fundacionAvatar,
            titulo: t('banner.titulo', {
              defaultValue: 'Detalle del rescate: {{lugar}}',
              lugar: rescate.lugar_rescate || t('lugar_no_especificado', 'Lugar no especificado'),
            }),
            solicitudes: 1,
            adopciones: rescate.estado === 'completado' ? 1 : 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="bento-container">
        {/* Botón volver */}
        <div className="rd-detalle-back">
          <button onClick={handleVolver} className="rd-detalle-btn-back">
            <ArrowLeft size={18} />
            {t('volver', 'Volver')}
          </button>
        </div>

        {/* Card principal */}
        <div className="rd-detalle-card">
          {/* Badges */}
          <div className="rd-detalle-badges">
            <span className={`rd-detalle-prioridad ${getPrioridadClass()}`}>
              {getPrioridadIcon()}
              {t('prioridad_label', 'Prioridad')}: {t(`prioridad_${rescate.prioridad}`)}
            </span>
            <span className={`rd-detalle-estado ${getEstadoClass()}`}>
              {getEstadoIcon()}
              {t(`estado_${rescate.estado}`)}
            </span>
            <span className="rd-detalle-tipo">
              <Tag size={14} />
              {t(`btn_${rescate.tipo_emergencia || 'otro'}`)}
            </span>
          </div>

          {/* ===== GALERÍA CON SELECTOR ===== */}
          {todasLasFotos.length > 0 && (
            <div className="rd-detalle-galeria-section">
              {/* FOTO GRANDE */}
              <div 
                className="rd-detalle-foto-grande"
                onClick={() => handleAbrirModal(fotoSeleccionada)}
              >
                <img 
                  src={fotoSeleccionada} 
                  alt="Foto seleccionada"
                  className="rd-detalle-foto-grande-img"
                />
                <div className="rd-detalle-foto-grande-overlay">
                  <Camera size={20} />
                  <span>{t('click_para_ampliar', 'Click para ampliar')}</span>
                </div>
              </div>

              {/* MINIATURAS - SELECTOR */}
              <div className="rd-detalle-miniaturas">
                {todasLasFotos.map((url, index) => (
                  <div
                    key={index}
                    className={`rd-detalle-miniatura ${fotoSeleccionada === url ? 'active' : ''}`}
                    onClick={() => handleSeleccionarFoto(url)}
                  >
                    <img src={url} alt={`Miniatura ${index + 1}`} />
                    {fotoSeleccionada === url && (
                      <div className="rd-detalle-miniatura-check">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFORMACIÓN */}
          <div className="rd-detalle-info">
            <div className="rd-detalle-info-group">
              <div className="rd-detalle-info-label">
                <MapPin size={16} />
                {t('lugar_label', 'Lugar')}
              </div>
              <p className="rd-detalle-info-value">{rescate.lugar_rescate}</p>
            </div>

            <div className="rd-detalle-info-group">
              <div className="rd-detalle-info-label">
                <Calendar size={16} />
                {t('fecha_label', 'Fecha')}
              </div>
              <p className="rd-detalle-info-value">{formatDate(rescate.fecha_rescate)}</p>
            </div>

            <div className="rd-detalle-info-group">
              <div className="rd-detalle-info-label">
                <FileText size={16} />
                {t('descripcion_label', 'Descripción')}
              </div>
              <p className="rd-detalle-info-value">{rescate.descripcion_rescate}</p>
            </div>

            {/* Datos del reportante */}
            {(rescate.nombre_reportante || rescate.telefono_reportante || rescate.email_reportante) && (
              <div className="rd-detalle-info-group">
                <div className="rd-detalle-info-label">
                  <User size={16} />
                  {t('reportado_por', 'Reportado por')}
                </div>
                <div className="rd-detalle-reportante">
                  {rescate.nombre_reportante && (
                    <span><User size={14} /> {rescate.nombre_reportante}</span>
                  )}
                  {rescate.telefono_reportante && (
                    <span><Phone size={14} /> {rescate.telefono_reportante}</span>
                  )}
                  {rescate.email_reportante && (
                    <span><Mail size={14} /> {rescate.email_reportante}</span>
                  )}
                </div>
              </div>
            )}

            {/* Coordenadas */}
            {rescate.lat && rescate.lng && (
              <div className="rd-detalle-info-group">
                <div className="rd-detalle-info-label">
                  <MapPin size={16} />
                  {t('coordenadas', 'Coordenadas')}
                </div>
                <div className="rd-detalle-coordenadas">
                  <span>
                    {parseFloat(rescate.lat).toFixed(6)}, {parseFloat(rescate.lng).toFixed(6)}
                  </span>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${rescate.lat}&mlon=${rescate.lng}#map=15/${rescate.lat}/${rescate.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rd-detalle-map-link"
                  >
                    <ExternalLink size={14} />
                    {t('ver_mapa', 'Ver mapa')}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ACCIONES */}
          <div className="rd-detalle-actions">
            {rescate.estado === 'pendiente' && (
              <>
                <button 
                  onClick={handleAceptar} 
                  className="rd-detalle-btn-primary" 
                  disabled={accionLoading}
                >
                  {accionLoading ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {t('aceptar_rescate', 'Aceptar rescate')}
                </button>
                <button 
                  onClick={handleRechazar} 
                  className="rd-detalle-btn-danger" 
                  disabled={accionLoading}
                >
                  <XCircle size={18} />
                  {t('rechazar_rescate', 'Rechazar rescate')}
                </button>
              </>
            )}

            {rescate.estado === 'en_proceso' && (
              <button onClick={handleRegistrarMascota} className="rd-detalle-btn-primary">
                <PawPrint size={18} />
                {t('registrar_mascota', 'Registrar mascota')}
              </button>
            )}

            {rescate.estado === 'completado' && (
              <div className="rd-detalle-status-completado">
                <CheckCircle size={20} />
                {t('rescate_completado', 'Rescate completado')}
              </div>
            )}

            {rescate.estado === 'rechazado' && (
              <div className="rd-detalle-status-rechazado">
                <XCircle size={20} />
                {t('rescate_rechazado', 'Rescate rechazado')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL PARA AMPLIAR FOTO ===== */}
      {isModalOpen && fotoSeleccionada && (
        <div className="rd-detalle-modal" onClick={handleCerrarModal}>
          <div className="rd-detalle-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="rd-detalle-modal-close" onClick={handleCerrarModal}>
              <XCircle size={28} />
            </button>
            
            <button 
              className="rd-detalle-modal-nav rd-detalle-modal-nav-left"
              onClick={(e) => { e.stopPropagation(); handleNavegarModal(-1); }}
            >
              <ChevronLeft size={32} />
            </button>

            <img 
              src={fotoSeleccionada} 
              alt="Foto ampliada"
              className="rd-detalle-modal-img"
            />

            <button 
              className="rd-detalle-modal-nav rd-detalle-modal-nav-right"
              onClick={(e) => { e.stopPropagation(); handleNavegarModal(1); }}
            >
              <ChevronRight size={32} />
            </button>

            <div className="rd-detalle-modal-counter">
              {todasLasFotos.indexOf(fotoSeleccionada) + 1} / {todasLasFotos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescateDetalle;