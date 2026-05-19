// src/pages/user/Solicitudes/Solicitudes.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import SolicitudPDF from '../../public/SolicitarAdopcion/components/SolicitudPDF';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Solicitudes.css';

const Solicitudes = () => {
  const { t } = useTranslation('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filaAbierta, setFilaAbierta] = useState(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const toggleDetalle = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/user/solicitudes');

      if (response.data.success) {
        const solicitudesData = response.data.data || [];
        const solicitudesList = solicitudesData.data || solicitudesData;
        setSolicitudes(Array.isArray(solicitudesList) ? solicitudesList : []);
      } else {
        throw new Error(response.data.message || t('error_respuesta'));
      }
    } catch (err) {
      console.error('❌ Error al cargar solicitudes:', err);
      
      let errorMessage = t('error_cargar_solicitudes');
      
      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case 401:
            errorMessage = t('error_sesion_expirada');
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 403:
            errorMessage = t('error_permisos');
            break;
          case 404:
            errorMessage = t('error_no_encontradas');
            break;
          case 500:
            errorMessage = t('error_servidor');
            break;
          default:
            errorMessage = `${t('error_servidor')} (${status})`;
        }
      } else if (err.request) {
        errorMessage = t('error_conexion');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': { text: t('estado_pendiente'), icon: 'fa-clock', class: 'pendiente' },
      'en_revision': { text: t('estado_en_revision'), icon: 'fa-search', class: 'en_revision' },
      'aprobada': { text: t('estado_aprobada'), icon: 'fa-check-circle', class: 'aprobada' },
      'rechazada': { text: t('estado_rechazada'), icon: 'fa-times-circle', class: 'rechazada' },
      'completada': { text: t('estado_completada'), icon: 'fa-check-double', class: 'completada' }
    };
    return estados[estado] || estados.pendiente;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return t('fecha_no_disponible');
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return fecha;
    }
  };

  const formatFechaCompleta = (fecha) => {
    if (!fecha) return t('fecha_no_disponible');
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fecha;
    }
  };

  const preparePDFData = (solicitud) => {
    const datos = solicitud.datos_adicionales || {};
    const mascotaInfo = solicitud.solicitable || {};
    
    let datosSessionStorage = null;
    try {
      const guardado = sessionStorage.getItem(`solicitud_pdf_${solicitud.id}`);
      if (guardado) {
        datosSessionStorage = JSON.parse(guardado);
      }
    } catch (e) {
      console.error('Error al parsear sessionStorage:', e);
    }

    return {
      solicitud: solicitud,
      mascota: mascotaInfo || datosSessionStorage?.mascota,
      formData: {
        nombre: solicitud.nombre_solicitante || datosSessionStorage?.formData?.nombre || t('no_especificado'),
        apellido: datos.apellido_solicitante || datosSessionStorage?.formData?.apellido || '',
        documento_identidad: datos.documento_identidad || datosSessionStorage?.formData?.documento_identidad || t('no_especificado'),
        email: solicitud.email_solicitante || datosSessionStorage?.formData?.email || t('no_especificado'),
        telefono: solicitud.telefono_solicitante || datosSessionStorage?.formData?.telefono || t('no_especificado'),
        ocupacion: datos.ocupacion || datosSessionStorage?.formData?.ocupacion || t('no_especificado'),
        direccion: datos.direccion || datosSessionStorage?.formData?.direccion || t('no_especificado'),
        ciudad: datos.ciudad || datosSessionStorage?.formData?.ciudad || t('no_especificado'),
        departamento: datos.departamento || datosSessionStorage?.formData?.departamento || '',
        codigo_postal: datos.codigo_postal || datosSessionStorage?.formData?.codigo_postal || '',
        estado_civil: datos.estado_civil || datosSessionStorage?.formData?.estado_civil || t('no_especificado'),
        cantidad_hijos: datos.cantidad_hijos || datosSessionStorage?.formData?.cantidad_hijos || '0',
        tipo_vivienda: datos.tipo_vivienda || datosSessionStorage?.formData?.tipo_vivienda || t('no_especificado'),
        es_propietario: datos.es_propietario || datosSessionStorage?.formData?.es_propietario || t('no_especificado'),
        experiencia_mascotas: datos.experiencia_mascotas || datosSessionStorage?.formData?.experiencia_mascotas || t('no_especificado'),
        motivo_adopcion: solicitud.contenido || datosSessionStorage?.formData?.motivo_adopcion || t('no_especificado'),
        compromiso_cuidado: datos.compromiso_cuidado || datosSessionStorage?.formData?.compromiso_cuidado || false,
        compromiso_esterilizacion: datos.compromiso_esterilizacion || datosSessionStorage?.formData?.compromiso_esterilizacion || false,
        compromiso_seguimiento: datos.compromiso_seguimiento || datosSessionStorage?.formData?.compromiso_seguimiento || false,
      }
    };
  };

  if (loading) {
    return (
      <div className="solicitudes-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando_solicitudes')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitudes-page">
        <div className="solicitudes-wrapper">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>{t('error_titulo')}</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={fetchSolicitudes} className="btn-retry">
                <i className="fas fa-redo"></i> {t('reintentar')}
              </button>
              <a href="/mascotas" className="btn-ver-mascotas">
                {t('ver_mascotas_disponibles')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-page">
      <div className="solicitudes-wrapper">
        <div className="solicitudes-header">
          <h1>🐾 {t('titulo')}</h1>
          <p>{t('subtitulo')}</p>
        </div>

        {solicitudes.length === 0 ? (
          <div className="no-solicitudes">
            <i className="fas fa-clipboard-list"></i>
            <h2>{t('sin_solicitudes')}</h2>
            <p>{t('sin_solicitudes_desc')}</p>
            <a href="/mascotas" className="btn-ver-mascotas">
              <i className="fas fa-paw"></i> {t('ver_mascotas_disponibles')}
            </a>
          </div>
        ) : (
          <div className="solicitudes-table">
            {/* Header de la tabla */}
            <div className="solicitudes-table-header">
              <div>{t('id') || 'ID'}</div>
              <div>{t('mascota') || 'Mascota'}</div>
              <div>{t('fecha_solicitud') || 'Fecha'}</div>
              <div>{t('estado') || 'Estado'}</div>
              <div>{t('acciones') || 'Acciones'}</div>
            </div>

            {/* Filas de solicitudes */}
            {solicitudes.map((solicitud) => {
              const estadoBadge = getEstadoBadge(solicitud.estado);
              const pdfData = preparePDFData(solicitud);
              const mascotaNombre = pdfData.mascota?.nombre_mascota || 
                                    solicitud.solicitable?.nombre_mascota || 
                                    t('mascota_no_disponible');
              const isOpen = filaAbierta === solicitud.id;

              return (
                <React.Fragment key={solicitud.id}>
                  <div className="solicitud-row">
                    <div className="solicitud-id">#{solicitud.id}</div>
                    <div className="solicitud-mascota-nombre">
                      <i className="fas fa-paw"></i> {mascotaNombre}
                    </div>
                    <div className="solicitud-fecha">
                      <i className="fas fa-calendar-alt"></i> {formatFecha(solicitud.created_at || solicitud.fecha_solicitud)}
                    </div>
                    <div>
                      <span className={`solicitud-estado ${estadoBadge.class}`}>
                        <i className={`fas ${estadoBadge.icon}`}></i>
                        {estadoBadge.text}
                      </span>
                    </div>
                    <div className="solicitud-actions">
                      <button 
                        className="btn-ver-detalle"
                        onClick={() => toggleDetalle(solicitud.id)}
                      >
                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                        {isOpen ? t('ocultar') : t('ver_detalle')}
                      </button>
                      <PDFDownloadLink
                        document={
                          <SolicitudPDF
                            solicitud={pdfData.solicitud}
                            mascota={pdfData.mascota}
                            formData={pdfData.formData}
                          />
                        }
                        fileName={`solicitud-adopcion-${solicitud.id}.pdf`}
                        className="btn-pdf-solicitud"
                      >
                        {({ loading: pdfLoading, error: pdfError }) => {
                          if (pdfError) {
                            return (
                              <span className="btn-pdf-error">
                                <i className="fas fa-exclamation-triangle"></i>
                              </span>
                            );
                          }
                          return pdfLoading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <>
                              <i className="fas fa-file-pdf"></i> PDF
                            </>
                          );
                        }}
                      </PDFDownloadLink>
                    </div>
                  </div>

                  {/* Detalle desplegable */}
                  <div className={`solicitud-detalle ${isOpen ? 'abierto' : ''}`}>
                    <div className="solicitud-detalle-grid">
                      <div className="detalle-item">
                        <label>{t('fecha_completa') || 'Fecha de solicitud'}</label>
                        <p>{formatFechaCompleta(solicitud.created_at || solicitud.fecha_solicitud)}</p>
                      </div>
                      
                      {solicitud.contenido && (
                        <div className="detalle-item">
                          <label>{t('tu_mensaje') || 'Motivo / Mensaje'}</label>
                          <p className="mensaje">{solicitud.contenido}</p>
                        </div>
                      )}
                      
                      {solicitud.razon_rechazo && (
                        <div className="detalle-item">
                          <label>{t('razon_rechazo') || 'Razón del rechazo'}</label>
                          <p className="rechazo">{solicitud.razon_rechazo}</p>
                        </div>
                      )}
                      
                      {solicitud.notas_internas && (
                        <div className="detalle-item">
                          <label>{t('notas_adicionales') || 'Notas adicionales'}</label>
                          <p className="notas">{solicitud.notas_internas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;