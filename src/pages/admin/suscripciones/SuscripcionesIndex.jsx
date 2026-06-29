// src/pages/admin/suscripciones/SuscripcionesIndex.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import { RefreshCw, CreditCard, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import './SuscripcionesIndex.css';

const AdminSuscripcionesIndex = () => {
  const { t } = useTranslation(['admin', 'suscripciones']);
  const { user } = useAuth();
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suscripcionService.getAll();
      
      let suscripcionesData = [];
      let paginationData = {
        current_page: 1,
        total: 0,
        per_page: 15,
        last_page: 1
      };
      
      if (response?.data?.data) {
        suscripcionesData = response.data.data;
        if (response.data.pagination) {
          paginationData = response.data.pagination;
        }
      } else if (response?.data) {
        suscripcionesData = response.data;
      } else if (Array.isArray(response)) {
        suscripcionesData = response;
      }
      
      setSuscripciones(suscripcionesData);
      setPagination(paginationData);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || t('suscripciones:error_cargar_suscripciones'));
      toast.error(t('suscripciones:error_cargar_suscripciones'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarSuscripciones();
  };

  const handleCancelar = async (id) => {
    if (!window.confirm(t('suscripciones:confirmar_cancelar'))) return;
    
    setCancelando(id);
    try {
      await suscripcionService.cancelarSuscripcionAdmin(id);
      toast.success(t('suscripciones:suscripcion_cancelada'));
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('suscripciones:error_cancelar'));
    } finally {
      setCancelando(null);
    }
  };

  const handleReactivar = async (id) => {
    if (!window.confirm(t('suscripciones:confirmar_reactivar'))) return;
    
    setActualizando(id);
    try {
      await suscripcionService.actualizarSuscripcionAdmin(id, { estado: 'activo' });
      toast.success(t('suscripciones:suscripcion_reactivada'));
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('suscripciones:error_reactivar'));
    } finally {
      setActualizando(null);
    }
  };

  const handlePausar = async (id) => {
    if (!window.confirm(t('suscripciones:confirmar_pausar'))) return;
    
    setActualizando(id);
    try {
      await suscripcionService.actualizarSuscripcionAdmin(id, { estado: 'inactivo' });
      toast.success(t('suscripciones:suscripcion_pausada'));
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('suscripciones:error_pausar'));
    } finally {
      setActualizando(null);
    }
  };

  const handleReanudar = async (id) => {
    if (!window.confirm(t('suscripciones:confirmar_reactivar'))) return;
    
    setActualizando(id);
    try {
      await suscripcionService.actualizarSuscripcionAdmin(id, { estado: 'activo' });
      toast.success(t('suscripciones:suscripcion_reactivada'));
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || t('suscripciones:error_reactivar'));
    } finally {
      setActualizando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'estado-activo', label: t('suscripciones:estado_activo') },
      pendiente: { class: 'estado-pendiente', label: t('suscripciones:estado_pendiente') },
      pausado: { class: 'estado-pausado', label: t('suscripciones:estado_pausado') },
      inactivo: { class: 'estado-inactivo', label: t('suscripciones:estado_inactivo') },
      cancelado: { class: 'estado-cancelado', label: t('suscripciones:estado_cancelado') },
      finalizado: { class: 'estado-finalizado', label: t('suscripciones:estado_finalizado') }
    };
    return config[estado?.toLowerCase()] || config.pendiente;
  };

  const suscripcionesActivas = Array.isArray(suscripciones) 
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'activo')
    : [];

  const suscripcionesPendientes = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'pendiente')
    : [];

  const suscripcionesCanceladas = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'cancelado')
    : [];

  const suscripcionesInactivas = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'inactivo')
    : [];

  if (loading) {
    return (
      <div className="as-container">
        <div className="as-loading">
          <div className="as-spinner"></div>
          <p>{t('suscripciones:cargando_suscripciones')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="as-container">
        <div className="bento-container">
          <div className="as-error">
            <div className="as-error-icon">⚠️</div>
            <h3>{t('suscripciones:error_carga')}</h3>
            <p>{error}</p>
            <button onClick={cargarSuscripciones} className="as-btn-retry">
              {t('admin:reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container">
      <div className="as-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('admin:banner_suscripciones_titulo', {
              defaultValue: 'Suscripciones - {{total}} total',
              total: pagination.total || suscripciones.length,
            }),
            solicitudes: suscripciones.length,
            adopciones: suscripcionesActivas.length,
            eventos: suscripcionesPendientes.length,
          }}
        />
      </div>

      <div className="bento-container">
        <div className="as-header">
          <div className="as-header-left">
            <CreditCard size={20} className="as-header-icon" />
            <h2>{t('suscripciones:suscripciones')}</h2>
            <span className="as-badge-count">{pagination.total || suscripciones.length}</span>
          </div>
          <div className="as-header-right">
            <button onClick={handleRefresh} className="as-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'as-spin' : ''} />
              {t('admin:actualizar')}
            </button>
          </div>
        </div>

        <div className="as-stats-grid">
          <StatCard
            icon={<CreditCard size={24} />}
            label={t('suscripciones:total')}
            value={suscripciones.length}
            color="primary"
            subtitle={t('suscripciones:suscripciones')}
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            label={t('suscripciones:activas')}
            value={suscripcionesActivas.length}
            color="success"
            subtitle={t('suscripciones:activas')}
          />
          <StatCard
            icon={<Clock size={24} />}
            label={t('suscripciones:pendientes')}
            value={suscripcionesPendientes.length}
            color="warning"
            subtitle={t('suscripciones:pendientes')}
          />
          <StatCard
            icon={<XCircle size={24} />}
            label={t('suscripciones:inactivas')}
            value={suscripcionesInactivas.length}
            color="danger"
            subtitle={t('suscripciones:inactivas')}
          />
        </div>

        <div className="as-table-wrapper">
          <table className="as-table">
            <thead>
              <tr>
                <th>{t('suscripciones:id')}</th>
                <th>{t('suscripciones:usuario')}</th>
                <th>{t('suscripciones:email')}</th>
                <th>{t('suscripciones:mascota')}</th>
                <th>{t('suscripciones:monto')}</th>
                <th>{t('suscripciones:estado')}</th>
                <th>{t('suscripciones:inicio')}</th>
                <th>{t('suscripciones:acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(suscripciones) || suscripciones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="as-empty-row">
                    <p>{t('suscripciones:sin_suscripciones')}</p>
                  </td>
                </tr>
              ) : (
                suscripciones.map((suscripcion) => {
                  const estado = getEstadoBadge(suscripcion.estado);
                  const estaCancelando = cancelando === suscripcion.id;
                  const estaActualizando = actualizando === suscripcion.id;
                  
                  return (
                    <tr key={suscripcion.id}>
                      <td>#{suscripcion.id}</td>
                      <td>
                        {suscripcion.usuario?.name || 
                         suscripcion.usuario?.nombre || 
                         suscripcion.user?.name ||
                         t('suscripciones:usuario')}
                      </td>
                      <td>
                        {suscripcion.usuario?.email || 
                         suscripcion.user?.email ||
                         'N/A'}
                      </td>
                      <td>
                        {suscripcion.mascota?.nombre_mascota || 
                         suscripcion.mascota?.nombre || 
                         t('suscripciones:mascota')}
                      </td>
                      <td>${suscripcion.monto_mensual || suscripcion.monto || 0}</td>
                      <td>
                        <span className={`as-estado-badge ${estado.class}`}>
                          {estado.label}
                        </span>
                      </td>
                      <td>
                        {suscripcion.fecha_inicio 
                          ? new Date(suscripcion.fecha_inicio).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="as-actions-cell">
                          <Link
                            to={`/admin/suscripciones/${suscripcion.id}`}
                            className="as-action-btn as-btn-view"
                            title={t('suscripciones:ver_detalle')}
                          >
                            <Eye size={16} />
                          </Link>
                          
                          {(suscripcion.estado?.toLowerCase() === 'activo' || 
                            suscripcion.estado?.toLowerCase() === 'pendiente') && (
                            <button
                              className="as-action-btn as-btn-cancelar"
                              onClick={() => handleCancelar(suscripcion.id)}
                              disabled={estaCancelando || estaActualizando}
                              title={t('suscripciones:cancelar')}
                            >
                              {estaCancelando ? (
                                <div className="as-spinner-small"></div>
                              ) : (
                                <XCircle size={16} />
                              )}
                            </button>
                          )}
                          
                          {suscripcion.estado?.toLowerCase() === 'cancelado' && (
                            <button
                              className="as-action-btn as-btn-reactivar"
                              onClick={() => handleReactivar(suscripcion.id)}
                              disabled={estaActualizando}
                              title={t('suscripciones:reactivar')}
                            >
                              {estaActualizando ? (
                                <div className="as-spinner-small"></div>
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                          )}
                          
                          {suscripcion.estado?.toLowerCase() === 'activo' && (
                            <button
                              className="as-action-btn as-btn-pausar"
                              onClick={() => handlePausar(suscripcion.id)}
                              disabled={estaActualizando}
                              title={t('suscripciones:pausar')}
                            >
                              {estaActualizando ? (
                                <div className="as-spinner-small"></div>
                              ) : (
                                <Clock size={16} />
                              )}
                            </button>
                          )}
                          
                          {suscripcion.estado?.toLowerCase() === 'inactivo' && (
                            <button
                              className="as-action-btn as-btn-reanudar"
                              onClick={() => handleReanudar(suscripcion.id)}
                              disabled={estaActualizando}
                              title={t('suscripciones:reanudar')}
                            >
                              {estaActualizando ? (
                                <div className="as-spinner-small"></div>
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > 0 && (
          <div className="as-pagination-info">
            {t('suscripciones:mostrando_suscripciones', {
              count: suscripciones.length,
              total: pagination.total,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuscripcionesIndex;