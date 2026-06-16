// src/pages/user/Solicitudes/Solicitudes.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  });

  const fetchSolicitudes = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // OPTIMIZACIÓN: Paginación y campos específicos
      const response = await api.get('/user/solicitudes', {
        params: {
          page: page,
          perPage: pagination.perPage,
          sort: 'created_at',
          order: 'desc',
          fields: 'id,estado,created_at,contenido,solicitable_id,solicitable_type,nombre_solicitante,email_solicitante,telefono_solicitante,razon_rechazo,notas_internas,datos_adicionales'
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        const solicitudesList = data.data || data || [];
        setSolicitudes(Array.isArray(solicitudesList) ? solicitudesList : []);
        
        // Actualizar paginación
        setPagination({
          currentPage: data.current_page || page,
          perPage: data.per_page || pagination.perPage,
          total: data.total || solicitudesList.length,
          lastPage: data.last_page || 1
        });
      } else {
        throw new Error(response.data.message || t('error_respuesta'));
      }
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      
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
  }, [pagination.perPage, t]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const toggleDetalle = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= pagination.lastPage) {
      fetchSolicitudes(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const renderPagination = () => {
    if (pagination.lastPage <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="solicitudes-pagination">
        <button
          onClick={() => cambiarPagina(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="solicitudes-pagination-btn"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => cambiarPagina(1)} className="solicitudes-pagination-btn">1</button>
            {startPage > 2 && <span className="solicitudes-pagination-dots">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => cambiarPagina(page)}
            className={`solicitudes-pagination-btn ${pagination.currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
        
        {endPage < pagination.lastPage && (
          <>
            {endPage < pagination.lastPage - 1 && <span className="solicitudes-pagination-dots">...</span>}
            <button onClick={() => cambiarPagina(pagination.lastPage)} className="solicitudes-pagination-btn">
              {pagination.lastPage}
            </button>
          </>
        )}
        
        <button
          onClick={() => cambiarPagina(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.lastPage}
          className="solicitudes-pagination-btn"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="solicitudes-page">
        <div className="solicitudes-loading">
          <LoadingSpinner text={t('cargando_solicitudes')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitudes-page">
        <div className="solicitudes-wrapper">
          <div className="solicitudes-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>{t('error_titulo')}</h2>
            <p>{error}</p>
            <div className="solicitudes-error-actions">
              <button onClick={() => fetchSolicitudes()} className="solicitudes-retry-btn">
                <i className="fas fa-redo"></i> {t('reintentar')}
              </button>
              <a href="/mascotas" className="solicitudes-mascotas-btn">
                <i className="fas fa-paw"></i> {t('ver_mascotas_disponibles')}
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
          <h1>
            <i className="fas fa-clipboard-list"></i> {t('titulo')}
          </h1>
          <p>{t('subtitulo')}</p>
        </div>

        {solicitudes.length === 0 ? (
          <div className="solicitudes-vacio">
            <i className="fas fa-clipboard-list"></i>
            <h2>{t('sin_solicitudes')}</h2>
            <p>{t('sin_solicitudes_desc')}</p>
            <a href="/mascotas" className="solicitudes-vacio-btn">
              <i className="fas fa-paw"></i> {t('ver_mascotas_disponibles')}
            </a>
          </div>
        ) : (
          <>
            <div className="solicitudes-table-container">
              <div className="solicitudes-table">
                <div className="solicitudes-table-header">
                  <div>{t('id')}</div>
                  <div>{t('mascota')}</div>
                  <div>{t('fecha_solicitud')}</div>
                  <div>{t('estado')}</div>
                  <div>{t('acciones')}</div>
                </div>

                {solicitudes.map((solicitud) => {
                  const estadoBadge = getEstadoBadge(solicitud.estado);
                  const pdfData = preparePDFData(solicitud);
                  const mascotaNombre = pdfData.mascota?.nombre_mascota || 
                                        solicitud.solicitable?.nombre_mascota || 
                                        t('mascota_no_disponible');
                  const isOpen = filaAbierta === solicitud.id;

                  return (
                    <React.Fragment key={solicitud.id}>
                      <div className="solicitudes-row">
                        <div className="solicitudes-id">#{solicitud.id}</div>
                        <div className="solicitudes-mascota">
                          <i className="fas fa-paw"></i> {mascotaNombre}
                        </div>
                        <div className="solicitudes-fecha">
                          <i className="fas fa-calendar-alt"></i> {formatFecha(solicitud.created_at)}
                        </div>
                        <div>
                          <span className={`solicitudes-estado ${estadoBadge.class}`}>
                            <i className={`fas ${estadoBadge.icon}`}></i>
                            {estadoBadge.text}
                          </span>
                        </div>
                        <div className="solicitudes-acciones">
                          <button 
                            className="solicitudes-detalle-btn"
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
                            className="solicitudes-pdf-btn"
                          >
                            {({ loading: pdfLoading, error: pdfError }) => {
                              if (pdfError) {
                                return (
                                  <span className="solicitudes-pdf-error">
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

                      <div className={`solicitudes-detalle ${isOpen ? 'abierto' : ''}`}>
                        <div className="solicitudes-detalle-grid">
                          <div className="solicitudes-detalle-item">
                            <label>{t('fecha_completa')}</label>
                            <p>{formatFechaCompleta(solicitud.created_at)}</p>
                          </div>
                          
                          {solicitud.contenido && (
                            <div className="solicitudes-detalle-item">
                              <label>{t('tu_mensaje')}</label>
                              <p className="solicitudes-mensaje">{solicitud.contenido}</p>
                            </div>
                          )}
                          
                          {solicitud.razon_rechazo && (
                            <div className="solicitudes-detalle-item">
                              <label>{t('razon_rechazo')}</label>
                              <p className="solicitudes-rechazo">{solicitud.razon_rechazo}</p>
                            </div>
                          )}
                          
                          {solicitud.notas_internas && (
                            <div className="solicitudes-detalle-item">
                              <label>{t('notas_adicionales')}</label>
                              <p className="solicitudes-notas">{solicitud.notas_internas}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;