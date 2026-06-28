// src/pages/fundacion/adopciones/Solicitudes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import SolicitudPDF from '../../public/SolicitarAdopcion/components/SolicitudPDF';
import { ClipboardList, Clock, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import './Solicitudes.css';

const Solicitudes = () => {
  const { t } = useTranslation('fundacion');
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filaAbierta, setFilaAbierta] = useState(null);
  const [accionando, setAccionando] = useState(null);

  const totalPendientes = pagination.total || items.length;

  const fetchItems = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/entity/solicitudes', {
        params: {
          page,
          per_page: 10,
          estado: 'pendiente',
          fields: 'id,estado,created_at,contenido,solicitable_id,solicitable_type,nombre_solicitante,email_solicitante,telefono_solicitante,razon_rechazo,notas_internas,datos_adicionales',
          include: 'solicitable,usuario',
          sort: 'created_at',
          order: 'desc',
        },
      });

      const data = response.data?.data || response.data;
      const list = data?.data || data || [];

      setItems(Array.isArray(list) ? list : []);
      setPagination({
        current_page: data?.current_page || page,
        last_page: data?.last_page || 1,
        total: data?.total || list.length,
      });
      setCurrentPage(page);
    } catch (err) {
      console.error('Error:', err);
      setError(t('error_cargar_solicitudes'));
      toast.error(err.response?.data?.message || t('error_cargar_solicitudes'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems(currentPage);
  };

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > pagination.last_page) return;
    fetchItems(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDetalle = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
  };

  const handleAprobar = async (id) => {
    if (!window.confirm(t('confirmar_aprobar'))) return;
    
    setAccionando(id);
    try {
      await api.put(`/entity/solicitudes/${id}/aprobar`);
      toast.success('✅ ' + t('solicitud_aprobada'));
      fetchItems(currentPage);
    } catch (err) {
      console.error('Error al aprobar:', err);
      toast.error('❌ ' + (err.response?.data?.message || t('error_aprobar')));
    } finally {
      setAccionando(null);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt(t('razon_rechazo_prompt'));
    if (motivo === null) return;
    
    if (!motivo.trim()) {
      toast.warning(t('razon_rechazo_requerida'));
      return;
    }
    
    setAccionando(id);
    try {
      await api.put(`/entity/solicitudes/${id}/rechazar`, {
        razon_rechazo: motivo.trim()
      });
      toast.success('✅ ' + t('solicitud_rechazada'));
      fetchItems(currentPage);
    } catch (err) {
      console.error('Error al rechazar:', err);
      toast.error('❌ ' + (err.response?.data?.message || t('error_rechazar')));
    } finally {
      setAccionando(null);
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

    const usuario = solicitud.usuario || {};

    return {
      solicitud: solicitud,
      mascota: mascotaInfo || datosSessionStorage?.mascota,
      formData: {
        nombre: usuario.nombre || solicitud.nombre_solicitante || datosSessionStorage?.formData?.nombre || t('no_especificado'),
        apellido: datos.apellido_solicitante || datosSessionStorage?.formData?.apellido || '',
        documento_identidad: datos.documento_identidad || datosSessionStorage?.formData?.documento_identidad || t('no_especificado'),
        email: usuario.email || solicitud.email_solicitante || datosSessionStorage?.formData?.email || t('no_especificado'),
        telefono: usuario.telefono || solicitud.telefono_solicitante || datosSessionStorage?.formData?.telefono || t('no_especificado'),
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

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { label: t('estado_pendiente'), class: 'estado-pendiente' },
      en_revision: { label: t('estado_en_revision'), class: 'estado-revision' },
      aprobada: { label: t('estado_aprobada'), class: 'estado-aprobada' },
      rechazada: { label: t('estado_rechazada'), class: 'estado-rechazada' },
      completada: { label: t('estado_completada'), class: 'estado-completada' },
    };
    return estados[estado] || estados.pendiente;
  };

  const fundacionName = user?.nombre || user?.name || t('fundacion');
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  if (loading) {
    return (
      <div className="solicitudes-container">
        <LoadingSpinner text={t('cargando')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitudes-container">
        <div className="solicitudes-wrapper">
          <div className="solicitudes-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>{t('error_titulo')}</h3>
            <p>{error}</p>
            <button onClick={() => fetchItems()} className="solicitudes-btn-retry">
              <i className="fas fa-sync-alt"></i> {t('reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-container">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t('banner.titulo', {
            defaultValue: '{{count}} solicitudes pendientes de revisión',
            count: totalPendientes,
          }),
          solicitudes: totalPendientes,
          adopciones: 0,
          eventos: 0,
        }}
      />

      <div className="solicitudes-wrapper">
        <section className="solicitudes-stats-section">
          <div className="solicitudes-stats-grid">
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.pendientes', 'Pendientes')}
              value={totalPendientes}
              color="warning"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              label={t('stats.aprobadas', 'Aprobadas')}
              value={0}
              color="success"
            />
            <StatCard
              icon={<XCircle size={24} />}
              label={t('stats.rechazadas', 'Rechazadas')}
              value={0}
              color="danger"
            />
          </div>
        </section>

        <div className="solicitudes-header">
          <div className="solicitudes-header-left">
            <h1>
              <i className="fas fa-clipboard-list"></i>
              {t('solicitudes')}
            </h1>
            <p>{t('solicitudes_desc')}</p>
          </div>
          <div className="solicitudes-header-right">
            <button onClick={handleRefresh} className="solicitudes-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {t('actualizar', 'Actualizar')}
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="solicitudes-empty">
            <i className="fas fa-clipboard-list"></i>
            <h3>{t('sin_solicitudes')}</h3>
            <p>{t('sin_solicitudes_desc')}</p>
          </div>
        ) : (
          <>
            <div className="solicitudes-table-wrap">
              <table className="solicitudes-table">
                <thead>
                  <tr>
                    <th>{t('id')}</th>
                    <th>{t('mascota')}</th>
                    <th>{t('solicitante')}</th>
                    <th>{t('fecha')}</th>
                    <th>{t('estado')}</th>
                    <th>{t('acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const estado = getEstadoBadge(item.estado);
                    const mascotaNombre = item.solicitable?.nombre_mascota || t('mascota_no_disponible');
                    const solicitanteNombre = item.usuario?.nombre || item.nombre_solicitante || t('no_especificado');
                    const isOpen = filaAbierta === item.id;
                    const estaCargando = accionando === item.id;
                    const pdfData = preparePDFData(item);

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="solicitudes-row">
                          <td className="solicitudes-id">#{item.id}</td>
                          <td>
                            <i className="fas fa-paw"></i> {mascotaNombre}
                          </td>
                          <td>{solicitanteNombre}</td>
                          <td>{formatDate(item.created_at)}</td>
                          <td>
                            <span className={`solicitudes-estado ${estado.class}`}>
                              {estado.label}
                            </span>
                          </td>
                          <td>
                            <div className="acciones-container">
                              <button
                                className="btn-accion btn-ver-detalle"
                                onClick={() => toggleDetalle(item.id)}
                                disabled={estaCargando}
                                title={isOpen ? t('ocultar') : t('ver_detalle')}
                              >
                                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                                <span>{isOpen ? t('ocultar') : t('detalle')}</span>
                              </button>

                              <PDFDownloadLink
                                document={
                                  <SolicitudPDF
                                    solicitud={pdfData.solicitud}
                                    mascota={pdfData.mascota}
                                    formData={pdfData.formData}
                                  />
                                }
                                fileName={`solicitud-adopcion-${item.id}.pdf`}
                                className="btn-accion btn-pdf"
                              >
                                {({ loading: pdfLoading, error: pdfError }) => {
                                  if (pdfError) {
                                    return (
                                      <span className="btn-pdf-error" title={t('error_pdf')}>
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>PDF</span>
                                      </span>
                                    );
                                  }
                                  return pdfLoading ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin"></i>
                                      <span>PDF</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileText size={14} />
                                      <span>PDF</span>
                                    </>
                                  );
                                }}
                              </PDFDownloadLink>

                              {item.estado === 'pendiente' && (
                                <>
                                  <button
                                    className="btn-accion btn-aprobar"
                                    onClick={() => handleAprobar(item.id)}
                                    disabled={estaCargando}
                                    title={t('aprobar')}
                                  >
                                    {estaCargando ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fas fa-check"></i>
                                    )}
                                    <span>{t('aprobar')}</span>
                                  </button>
                                  <button
                                    className="btn-accion btn-rechazar"
                                    onClick={() => handleRechazar(item.id)}
                                    disabled={estaCargando}
                                    title={t('rechazar')}
                                  >
                                    <i className="fas fa-times"></i>
                                    <span>{t('rechazar')}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan="6" className="solicitudes-detalle">
                              <div className="solicitudes-detalle-grid">
                                <div>
                                  <strong>{t('email')}</strong>
                                  <p>{item.usuario?.email || item.email_solicitante || t('no_especificado')}</p>
                                </div>
                                <div>
                                  <strong>{t('telefono')}</strong>
                                  <p>{item.usuario?.telefono || item.telefono_solicitante || t('no_especificado')}</p>
                                </div>
                                <div className="full">
                                  <strong>{t('mensaje')}</strong>
                                  <p>{item.contenido || item.mensaje || t('no_especificado')}</p>
                                </div>
                                {item.razon_rechazo && (
                                  <div className="full">
                                    <strong>{t('razon_rechazo')}</strong>
                                    <p className="solicitudes-rechazo">{item.razon_rechazo}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.last_page > 1 && (
              <div className="solicitudes-paginacion">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="solicitudes-paginacion-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span>
                  {t('pagina')} {currentPage} {t('de')} {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="solicitudes-paginacion-btn"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;