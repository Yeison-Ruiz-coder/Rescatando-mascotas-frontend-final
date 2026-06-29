// src/pages/fundacion/suscripciones/SuscripcionesIndex.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import './SuscripcionesIndex.css';

const FundacionSuscripcionesIndex = () => {
  const { t } = useTranslation(['fundacion', 'suscripciones']);
  const { user } = useAuth();
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activas: 0,
    pendientes: 0,
    pausadas: 0,
    canceladas: 0,
    montoTotal: 0
  });

  const fundacionName = user?.nombre || user?.name || t('fundacion');
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getSuscripcionesEntity();
      setSuscripciones(data);
      
      const activas = data.filter(s => s.estado === 'activo').length;
      const pendientes = data.filter(s => s.estado === 'pendiente').length;
      const pausadas = data.filter(s => s.estado === 'pausado').length;
      const canceladas = data.filter(s => s.estado === 'cancelado').length;
      const montoTotal = data.reduce((sum, s) => sum + parseFloat(s.monto_mensual || 0), 0);
      
      setEstadisticas({
        total: data.length,
        activas,
        pendientes,
        pausadas,
        canceladas,
        montoTotal
      });
    } catch (error) {
      toast.error(t('error_cargar_suscripciones'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePausar = async (id) => {
    if (!window.confirm(t('confirmar_pausar'))) return;
    try {
      await suscripcionService.pausarSuscripcionEntity(id);
      toast.success(t('suscripcion_pausada'));
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('error_pausar'));
    }
  };

  const handleReactivar = async (id) => {
    if (!window.confirm(t('confirmar_reactivar'))) return;
    try {
      await suscripcionService.reactivarSuscripcionEntity(id);
      toast.success(t('suscripcion_reactivada'));
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('error_reactivar'));
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm(t('confirmar_cancelar'))) return;
    try {
      await suscripcionService.cancelarSuscripcionEntity(id);
      toast.success(t('suscripcion_cancelada'));
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('error_cancelar'));
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'estado-activo', icon: 'fa-check-circle', label: t('estado_activo') },
      pendiente: { class: 'estado-pendiente', icon: 'fa-clock', label: t('estado_pendiente') },
      pausado: { class: 'estado-pausado', icon: 'fa-pause-circle', label: t('estado_pausado') },
      cancelado: { class: 'estado-cancelado', icon: 'fa-times-circle', label: t('estado_cancelado') },
      finalizado: { class: 'estado-finalizado', icon: 'fa-flag-checkered', label: t('estado_finalizado') }
    };
    return config[estado] || config.cancelado;
  };

  const getFrecuenciaTexto = (frecuencia) => {
    const textos = {
      unica: t('frecuencia_unica'),
      mensual: t('frecuencia_mensual'),
      trimestral: t('frecuencia_trimestral'),
      anual: t('frecuencia_anual')
    };
    return textos[frecuencia] || frecuencia;
  };

  const suscripcionesFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return suscripciones;
    return suscripciones.filter(s => s.estado === filtroEstado);
  }, [suscripciones, filtroEstado]);

  const totalFiltrado = suscripcionesFiltradas.length;

  if (loading) {
    return (
      <div className="fs-suscripciones-page">
        <div className="fs-loading">
          <div className="spinner"></div>
          <p>{t('cargando_suscripciones')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fs-suscripciones-page">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t('banner.titulo_suscripciones', {
            defaultValue: 'Suscripciones recibidas - {{total}} total',
            total: estadisticas.total
          }),
          solicitudes: estadisticas.total,
          adopciones: estadisticas.activas,
          eventos: estadisticas.pendientes,
        }}
      />

      <div className="fs-wrapper">
        {/* Estadísticas */}
        <div className="fs-stats-grid">
          <div className="fs-stat-card fs-stat-total">
            <div className="fs-stat-icon"><i className="fas fa-users"></i></div>
            <div className="fs-stat-info">
              <span className="fs-stat-value">{estadisticas.total}</span>
              <span className="fs-stat-label">{t('total')}</span>
            </div>
          </div>
          <div className="fs-stat-card fs-stat-activas">
            <div className="fs-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="fs-stat-info">
              <span className="fs-stat-value">{estadisticas.activas}</span>
              <span className="fs-stat-label">{t('activas')}</span>
            </div>
          </div>
          <div className="fs-stat-card fs-stat-pendientes">
            <div className="fs-stat-icon"><i className="fas fa-clock"></i></div>
            <div className="fs-stat-info">
              <span className="fs-stat-value">{estadisticas.pendientes}</span>
              <span className="fs-stat-label">{t('pendientes')}</span>
            </div>
          </div>
          <div className="fs-stat-card fs-stat-monto">
            <div className="fs-stat-icon"><i className="fas fa-money-bill-wave"></i></div>
            <div className="fs-stat-info">
              <span className="fs-stat-value">${estadisticas.montoTotal.toLocaleString()}</span>
              <span className="fs-stat-label">{t('monto_total')}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="fs-filters">
          <div className="fs-filter-group">
            <button
              className={`fs-filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('todos')}
            >
              {t('todos')} ({estadisticas.total})
            </button>
            <button
              className={`fs-filter-btn ${filtroEstado === 'activo' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('activo')}
            >
              <i className="fas fa-check-circle"></i> {t('activas')} ({estadisticas.activas})
            </button>
            <button
              className={`fs-filter-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('pendiente')}
            >
              <i className="fas fa-clock"></i> {t('pendientes')} ({estadisticas.pendientes})
            </button>
            <button
              className={`fs-filter-btn ${filtroEstado === 'pausado' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('pausado')}
            >
              <i className="fas fa-pause-circle"></i> {t('pausadas')} ({estadisticas.pausadas})
            </button>
            <button
              className={`fs-filter-btn ${filtroEstado === 'cancelado' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('cancelado')}
            >
              <i className="fas fa-times-circle"></i> {t('canceladas')} ({estadisticas.canceladas})
            </button>
          </div>
          <button
            className="fs-share-btn"
            onClick={() => {
              const url = `${window.location.origin}/suscripciones`;
              navigator.clipboard?.writeText(url);
              toast.info(t('link_copiado'));
            }}
          >
            <i className="fas fa-share-alt"></i> {t('compartir_enlace')}
          </button>
        </div>

        {/* Tabla */}
        <div className="fs-table-container">
          {suscripcionesFiltradas.length === 0 ? (
            <div className="fs-empty">
              <i className="fas fa-inbox"></i>
              <h3>{t('sin_suscripciones')}</h3>
              <p>{t('sin_suscripciones_desc')}</p>
              <button
                className="fs-share-btn"
                onClick={() => {
                  const url = `${window.location.origin}/suscripciones`;
                  navigator.clipboard?.writeText(url);
                  toast.info(t('link_copiado'));
                }}
              >
                <i className="fas fa-share-alt"></i> {t('compartir_enlace')}
              </button>
            </div>
          ) : (
            <div className="fs-table-scroll">
              <table className="fs-table">
                <thead>
                  <tr>
                    <th>{t('num', '#')}</th>
                    <th>{t('mascota')}</th>
                    <th>{t('donante')}</th>
                    <th>{t('monto')}</th>
                    <th>{t('frecuencia')}</th>
                    <th>{t('estado')}</th>
                    <th>{t('inicio')}</th>
                    <th>{t('acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {suscripcionesFiltradas.map((suscripcion, index) => {
                    const estado = getEstadoBadge(suscripcion.estado);
                    return (
                      <tr key={suscripcion.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fs-mascota-cell">
                            <strong>{suscripcion.mascota?.nombre || t('no_disponible')}</strong>
                            <span className="fs-mascota-id">{t('id')}: {suscripcion.mascota_id}</span>
                          </div>
                        </td>
                        <td>
                          <div className="fs-donante-cell">
                            <span>{suscripcion.user?.name || suscripcion.user?.nombre || `${t('usuario')} #${suscripcion.user_id}`}</span>
                            <span className="fs-donante-email">{suscripcion.user?.email || ''}</span>
                          </div>
                        </td>
                        <td className="fs-monto">${parseFloat(suscripcion.monto_mensual || 0).toLocaleString()}</td>
                        <td><span className="fs-frecuencia-badge">{getFrecuenciaTexto(suscripcion.frecuencia)}</span></td>
                        <td>
                          <span className={`fs-estado-badge ${estado.class}`}>
                            <i className={`fas ${estado.icon}`}></i> {estado.label}
                          </span>
                        </td>
                        <td>{suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="fs-actions">
                            <Link
                              to={`/fundacion/suscripciones/${suscripcion.id}`}
                              className="fs-btn fs-btn-ver"
                              title={t('ver_detalle')}
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            {suscripcion.estado === 'activo' && (
                              <button
                                className="fs-btn fs-btn-pausar"
                                onClick={() => handlePausar(suscripcion.id)}
                                title={t('pausar')}
                              >
                                <i className="fas fa-pause"></i>
                              </button>
                            )}
                            {suscripcion.estado === 'pausado' && (
                              <button
                                className="fs-btn fs-btn-reactivar"
                                onClick={() => handleReactivar(suscripcion.id)}
                                title={t('reactivar')}
                              >
                                <i className="fas fa-play"></i>
                              </button>
                            )}
                            {(suscripcion.estado === 'activo' || suscripcion.estado === 'pausado' || suscripcion.estado === 'pendiente') && (
                              <button
                                className="fs-btn fs-btn-cancelar"
                                onClick={() => handleCancelar(suscripcion.id)}
                                title={t('cancelar')}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="fs-footer">
          <span className="fs-total-info">
            {t('mostrando')} {totalFiltrado} {t('de')} {estadisticas.total} {t('suscripciones')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundacionSuscripcionesIndex;