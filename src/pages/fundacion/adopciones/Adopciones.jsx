// src/pages/fundacion/adopciones/Adopciones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { PawPrint, CheckCircle, Clock, Heart, RefreshCw } from 'lucide-react';
import './Adopciones.css';

const FundacionAdopciones = () => {
  const { t } = useTranslation('fundacion');
  const { user } = useAuth();
  const [adopciones, setAdopciones] = useState([]);
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

  // Estadísticas
  const totalAdopciones = pagination.total || adopciones.length;
  const enProceso = adopciones.filter(a => a.estado === 'en_proceso' || a.estado === 'aprobada').length;
  const completadas = adopciones.filter(a => a.estado === 'completada').length;

  const fetchAdopciones = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/entity/solicitudes', {
        params: {
          page,
          per_page: 10,
          estado: 'aprobada',
          sort: 'created_at',
          order: 'desc',
        },
      });

      const data = response.data?.data || response.data;
      const list = data?.data || data || [];

      setAdopciones(Array.isArray(list) ? list : []);
      setPagination({
        current_page: data?.current_page || page,
        last_page: data?.last_page || 1,
        total: data?.total || list.length,
      });
      setCurrentPage(page);
    } catch (err) {
      console.error('Error:', err);
      setError(t('error_cargar_adopciones'));
      toast.error(t('error_cargar_adopciones'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAdopciones();
  }, [fetchAdopciones]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdopciones(currentPage);
  };

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > pagination.last_page) return;
    fetchAdopciones(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDetalle = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
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
      <div className="adopciones-container">
        <LoadingSpinner text={t('cargando_adopciones')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="adopciones-container">
        <div className="adopciones-wrapper">
          <div className="adopciones-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>{t('error_titulo')}</h3>
            <p>{error}</p>
            <button onClick={() => fetchAdopciones()} className="adopciones-btn-retry">
              <i className="fas fa-sync-alt"></i> {t('reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adopciones-container">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="adopciones-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: fundacionName,
            avatar: fundacionAvatar,
            titulo: t('banner.titulo', {
              defaultValue: '{{count}} adopciones realizadas',
              count: totalAdopciones,
            }),
            solicitudes: totalAdopciones,
            adopciones: enProceso,
            eventos: completadas,
          }}
        />
      </div>

      <div className="adopciones-wrapper">
        {/* ===== STATS CARDS ===== */}
        <section className="adopciones-stats-section">
          <div className="adopciones-stats-grid">
            <StatCard
              icon={<Heart size={24} />}
              label={t('stats.total', 'Total Adopciones')}
              value={totalAdopciones}
              color="primary"
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.en_proceso', 'En Proceso')}
              value={enProceso}
              color="warning"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              label={t('stats.completadas', 'Completadas')}
              value={completadas}
              color="success"
            />
          </div>
        </section>

        {/* ===== HEADER ===== */}
        <div className="adopciones-header">
          <div className="adopciones-header-left">
            <h1>
              <i className="fas fa-paw"></i>
              {t('adopciones')}
            </h1>
            <p>{t('adopciones_desc')}</p>
          </div>
          <div className="adopciones-header-right">
            <button onClick={handleRefresh} className="adopciones-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {t('actualizar', 'Actualizar')}
            </button>
          </div>
        </div>

        {adopciones.length === 0 ? (
          <div className="adopciones-empty">
            <i className="fas fa-paw"></i>
            <h3>{t('sin_adopciones')}</h3>
            <p>{t('sin_adopciones_desc')}</p>
          </div>
        ) : (
          <>
            <div className="adopciones-table-wrap">
              <table className="adopciones-table">
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
                  {adopciones.map((item) => {
                    const estado = getEstadoBadge(item.estado);
                    const mascotaNombre = item.solicitable?.nombre_mascota || t('mascota_no_disponible');
                    const solicitanteNombre = item.usuario?.nombre || item.nombre_solicitante || t('no_especificado');
                    const isOpen = filaAbierta === item.id;

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="adopciones-row">
                          <td className="adopciones-id">#{item.id}</td>
                          <td>
                            <i className="fas fa-paw"></i> {mascotaNombre}
                          </td>
                          <td>{solicitanteNombre}</td>
                          <td>{formatDate(item.created_at)}</td>
                          <td>
                            <span className={`adopciones-estado ${estado.class}`}>
                              {estado.label}
                            </span>
                          </td>
                          <td>
                            <button
                              className="adopciones-btn-detalle"
                              onClick={() => toggleDetalle(item.id)}
                            >
                              <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                              {isOpen ? t('ocultar') : t('ver')}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan="6" className="adopciones-detalle">
                              <div className="adopciones-detalle-grid">
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
                                  <p>{item.contenido || t('no_especificado')}</p>
                                </div>
                                {item.razon_rechazo && (
                                  <div className="full">
                                    <strong>{t('razon_rechazo')}</strong>
                                    <p className="adopciones-rechazo">{item.razon_rechazo}</p>
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
              <div className="adopciones-paginacion">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="adopciones-paginacion-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span>
                  {t('pagina')} {currentPage} {t('de')} {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="adopciones-paginacion-btn"
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

// ===== STAT CARD =====
const StatCard = ({ icon, label, value, color }) => {
  const getColorClass = () => {
    switch (color) {
      case 'danger': return 'stat-danger';
      case 'warning': return 'stat-warning';
      case 'success': return 'stat-success';
      default: return 'stat-primary';
    }
  };

  return (
    <div className={`stat-card-modern ${getColorClass()}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">{label}</span>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{label}</span>
      </div>
    </div>
  );
};

export default FundacionAdopciones;