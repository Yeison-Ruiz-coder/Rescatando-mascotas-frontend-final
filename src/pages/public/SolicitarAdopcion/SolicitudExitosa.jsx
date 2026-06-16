// src/pages/public/SolicitarAdopcion/SolicitudExitosa.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PDFDownloadLink } from '@react-pdf/renderer';
import api from '../../../services/api';
import SolicitudPDF from './components/SolicitudPDF';
import './SolicitudExitosa.css';

const SolicitudExitosa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('adoption');
  const [solicitud, setSolicitud] = useState(null);
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSolicitud();
  }, [id]);

  const fetchSolicitud = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/solicitudes/${id}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setSolicitud(data);
        setMascota(data.solicitable);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(t('error_carga_solicitud'));
    } finally {
      setLoading(false);
    }
  };

  const datos = solicitud?.datos_adicionales || {};
  
  const datosGuardados = sessionStorage.getItem(`solicitud_pdf_${id}`);
  let datosSessionStorage = null;
  if (datosGuardados) {
    try {
      datosSessionStorage = JSON.parse(datosGuardados);
    } catch (e) {
      console.error('Error:', e);
    }
  }
  
  const formDataForPDF = {
    nombre: solicitud?.nombre_solicitante || datosSessionStorage?.formData?.nombre || t('no_especificado'),
    apellido: datos.apellido_solicitante || datosSessionStorage?.formData?.apellido || '',
    documento_identidad: datos.documento_identidad || datosSessionStorage?.formData?.documento_identidad || t('no_especificado'),
    email: solicitud?.email_solicitante || datosSessionStorage?.formData?.email || t('no_especificado'),
    telefono: solicitud?.telefono_solicitante || datosSessionStorage?.formData?.telefono || t('no_especificado'),
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
    motivo_adopcion: solicitud?.contenido || datosSessionStorage?.formData?.motivo_adopcion || t('no_especificado'),
    compromiso_cuidado: datos.compromiso_cuidado || datosSessionStorage?.formData?.compromiso_cuidado || false,
    compromiso_esterilizacion: datos.compromiso_esterilizacion || datosSessionStorage?.formData?.compromiso_esterilizacion || false,
    compromiso_seguimiento: datos.compromiso_seguimiento || datosSessionStorage?.formData?.compromiso_seguimiento || false,
  };

  if (loading) {
    return (
      <div className="sx-exitosa-wrapper">
        <div className="sx-bento-container">
          <div className="sx-loading-text">{t('cargando')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sx-exitosa-wrapper">
        <div className="sx-bento-container">
          <div className="sx-collage-card" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="sx-exitosa-icono">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 className="sx-exitosa-title">{t('error_titulo')}</h1>
            <p className="sx-exitosa-mensaje">{error}</p>
            <button onClick={() => navigate('/mascotas')} className="sx-btn-primario">
              {t('volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sx-exitosa-wrapper">
      <div className="sx-bento-container">
        <div className="sx-bento-grid">
          <div className="sx-bento-8">
            <div className="sx-collage-card">
              {/* Sticker decorativo */}
              <div className="sx-collage-sticker">
                <i className="fas fa-check-circle"></i>
                <span>¡Éxito!</span>
              </div>

              {/* Icono de éxito */}
              <div className="sx-exitosa-icono">
                <i className="fas fa-check-circle"></i>
              </div>
              
              <h1 className="sx-exitosa-title">{t('solicitud_exitosa')}</h1>
              
              <p className="sx-exitosa-mensaje">
                {t('solicitud_en_revision')}
              </p>

              {/* Detalles de la solicitud */}
              {solicitud && (
                <div className="sx-solicitud-detalles">
                  <p>
                    <strong>{t('estado')}:</strong>
                    <span className="sx-estado-badge">{solicitud.estado || 'Pendiente'}</span>
                  </p>
                  <p>
                    <strong>{t('fecha_creacion')}:</strong>
                    {new Date(solicitud.created_at).toLocaleDateString('es-ES')}
                  </p>
                  <p>
                    <strong>{t('mascota')}:</strong>
                    {mascota?.nombre_mascota || t('cargando')}
                  </p>
                  <p>
                    <strong>{t('tu_nombre')}:</strong>
                    {formDataForPDF.nombre} {formDataForPDF.apellido}
                  </p>
                </div>
              )}

              {/* Botón PDF */}
              {solicitud && (
                <div className="sx-pdf-container">
                  <PDFDownloadLink
                    document={
                      <SolicitudPDF 
                        solicitud={solicitud}
                        mascota={mascota || datosSessionStorage?.mascota}
                        formData={formDataForPDF}
                      />
                    }
                    fileName={`solicitud-adopcion-${solicitud.id}.pdf`}
                    className="sx-btn-pdf"
                  >
                    {({ loading: pdfLoading }) =>
                      pdfLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> {t('generando_pdf')}</>
                      ) : (
                        <><i className="fas fa-file-pdf"></i> {t('descargar_pdf')}</>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              )}

              {/* Botones de acción */}
              <div className="sx-exitosa-botones">
                <button onClick={() => navigate('/mascotas')} className="sx-btn-primario">
                  <i className="fas fa-paw"></i> {t('ver_mas_mascotas')}
                </button>
                <button onClick={() => navigate('/')} className="sx-btn-secundario">
                  <i className="fas fa-home"></i> {t('ir_inicio')}
                </button>
              </div>

              {/* Pasos siguientes */}
              <div className="sx-pasos-siguientes">
                <h3>
                  <i className="fas fa-calendar-check"></i>
                  {t('pasos_siguientes')}
                </h3>
                <ul>
                  <li>{t('espera_contacto')}</li>
                  <li>{t('entrevista')}</li>
                  <li>{t('visita_hogar')}</li>
                  <li>{t('firma_contrato')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudExitosa;