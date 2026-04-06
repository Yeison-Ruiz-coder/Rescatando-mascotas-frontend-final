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

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/user/solicitudes');
      console.log('📦 Solicitudes del usuario:', response.data);

      if (response.data.success) {
        const solicitudesData = response.data.data || [];
        const solicitudesList = solicitudesData.data || solicitudesData;
        setSolicitudes(Array.isArray(solicitudesList) ? solicitudesList : []);
        console.log(`✅ ${solicitudesList.length} ${t('solicitudes_cargadas')}`);
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
      'pendiente': { text: t('estado_pendiente'), color: '#856404', bg: '#fff3cd', icon: 'fa-clock' },
      'en_revision': { text: t('estado_en_revision'), color: '#0c5460', bg: '#d1ecf1', icon: 'fa-search' },
      'aprobada': { text: t('estado_aprobada'), color: '#155724', bg: '#d4edda', icon: 'fa-check-circle' },
      'rechazada': { text: t('estado_rechazada'), color: '#721c24', bg: '#f8d7da', icon: 'fa-times-circle' },
      'completada': { text: t('estado_completada'), color: '#004085', bg: '#cce5ff', icon: 'fa-check-double' }
    };
    return estados[estado] || estados.pendiente;
  };

  const formatFecha = (fecha) => {
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
        <div className="solicitudes-container">
          <LoadingSpinner text={t('cargando_solicitudes')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitudes-page">
        <div className="solicitudes-container">
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
      <div className="solicitudes-container">
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
          <div className="solicitudes-list">
            {solicitudes.map((solicitud) => {
              const estadoBadge = getEstadoBadge(solicitud.estado);
              const pdfData = preparePDFData(solicitud);
              const mascotaNombre = pdfData.mascota?.nombre_mascota || 
                                    solicitud.solicitable?.nombre_mascota || 
                                    t('mascota_no_disponible');

              return (
                <div key={solicitud.id} className="solicitud-card">
                  <div className="solicitud-header">
                    <div className="solicitud-info">
                      <h3>
                        <i className="fas fa-file-alt"></i> {t('solicitud_numero')} {solicitud.id}
                      </h3>
                      <p className="solicitud-fecha">
                        <i className="fas fa-calendar-alt"></i>
                        {formatFecha(solicitud.created_at || solicitud.fecha_solicitud)}
                      </p>
                    </div>
                    <div
                      className="solicitud-estado"
                      style={{
                        backgroundColor: estadoBadge.bg,
                        color: estadoBadge.color,
                      }}
                    >
                      <i className={`fas ${estadoBadge.icon}`}></i>
                      {estadoBadge.text}
                    </div>
                  </div>

                  <div className="solicitud-body">
                    <div className="solicitud-mascota">
                      <h4>
                        <i className="fas fa-paw"></i> {t('mascota_solicitada')}
                      </h4>
                      <p>{mascotaNombre}</p>
                    </div>

                    {solicitud.contenido && (
                      <div className="solicitud-motivo">
                        <h4>
                          <i className="fas fa-heart"></i> {t('tu_mensaje')}
                        </h4>
                        <p>{solicitud.contenido}</p>
                      </div>
                    )}

                    {solicitud.razon_rechazo && (
                      <div className="solicitud-rechazo">
                        <h4>
                          <i className="fas fa-exclamation-circle"></i> {t('razon_rechazo')}
                        </h4>
                        <p>{solicitud.razon_rechazo}</p>
                      </div>
                    )}

                    {solicitud.notas_internas && (
                      <div className="solicitud-notas">
                        <h4>
                          <i className="fas fa-sticky-note"></i> {t('notas_adicionales')}
                        </h4>
                        <p>{solicitud.notas_internas}</p>
                      </div>
                    )}
                  </div>

                  <div className="solicitud-actions">
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
                              <i className="fas fa-exclamation-triangle"></i> {t('error_pdf')}
                            </span>
                          );
                        }
                        return pdfLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> {t('generando_pdf')}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf"></i>
                            {t('descargar_pdf')}
                          </>
                        );
                      }}
                    </PDFDownloadLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;