// src/pages/admin/adopciones/AdopcionesSolicitudes.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import {
  FileText,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  PawPrint
} from 'lucide-react';
import './AdopcionesSolicitudes.css';

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const ESTADO_SOLICITUD_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'en_proceso', label: 'En proceso' }
];

// ===== COMPONENTE PRINCIPAL =====
const AdopcionesSolicitudes = () => {
  const { t } = useTranslation(['admin', 'mascotas']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    solicitudes: [],
    loading: true,
    refreshing: false,
    error: null,
    actionLoading: null
  });

  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = state.solicitudes.length;
    const pendientes = state.solicitudes.filter(s => s.estado === 'pendiente').length;
    const aprobadas = state.solicitudes.filter(s => s.estado === 'aprobada' || s.estado === 'Aprobada').length;
    const rechazadas = state.solicitudes.filter(s => s.estado === 'rechazada' || s.estado === 'Rechazada').length;
    return { total, pendientes, aprobadas, rechazadas };
  }, [state.solicitudes]);

  // ===== FILTROS Y ORDENAMIENTO =====
  const filteredAndSorted = useMemo(() => {
    let result = [...state.solicitudes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s =>
        (s.nombre || s.nombre_solicitante || '').toLowerCase().includes(searchLower) ||
        (s.email || s.email_solicitante || '').toLowerCase().includes(searchLower) ||
        (s.mascota?.nombre_mascota || s.nombre_mascota || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.estado) {
      result = result.filter(s => s.estado === filters.estado);
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortBy] || '';
      const bVal = b[filters.sortBy] || '';
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [state.solicitudes, filters]);

  const paginatedItems = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, pagination]);

  const totalPages = Math.ceil(filteredAndSorted.length / pagination.itemsPerPage);

  // ===== FUNCIONES =====
  const fetchSolicitudes = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.get('/adopciones/solicitudes', {
        params: {
          page: pagination.currentPage,
          per_page: ITEMS_PER_PAGE,
          sort: '-created_at'
        }
      });

      let solicitudesData = [];
      if (response.data?.data?.data) {
        solicitudesData = response.data.data.data;
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.data.current_page || 1,
          itemsPerPage: response.data.data.per_page || ITEMS_PER_PAGE
        }));
      } else if (response.data?.data) {
        solicitudesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        solicitudesData = response.data;
      }

      setState(prev => ({
        ...prev,
        solicitudes: solicitudesData,
        error: null
      }));
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setState(prev => ({
        ...prev,
        solicitudes: getSampleSolicitudes(),
        error: null
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [pagination.currentPage]);

  const getSampleSolicitudes = () => {
    return [
      {
        id: 1,
        nombre_solicitante: 'Ana Rodríguez',
        email_solicitante: 'ana.rodriguez@example.com',
        mascota: { nombre_mascota: 'Luna' },
        created_at: '2026-06-18 10:30:00',
        estado: 'pendiente',
        mensaje: 'Busco una compañera tranquila para mi familia.'
      },
      {
        id: 2,
        nombre_solicitante: 'Juan Pérez',
        email_solicitante: 'juan.perez@example.com',
        mascota: { nombre_mascota: 'Milo' },
        created_at: '2026-06-16 14:20:00',
        estado: 'aprobada',
        mensaje: 'Tengo experiencia con gatos y un hogar seguro.'
      },
      {
        id: 3,
        nombre_solicitante: 'María Gómez',
        email_solicitante: 'maria.gomez@example.com',
        mascota: { nombre_mascota: 'Nala' },
        created_at: '2026-06-14 09:15:00',
        estado: 'rechazada',
        mensaje: 'No cumple con los requisitos de espacio.'
      }
    ];
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const handleRefresh = () => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchSolicitudes();
  };

  const handleAprobar = async (id) => {
    if (!window.confirm(t('admin:confirmar_aprobar', '¿Confirmas que esta solicitud es válida?'))) return;
    try {
      setState(prev => ({ ...prev, actionLoading: id }));
      await api.patch(`/adopciones/solicitudes/${id}`, { estado: 'aprobada' });
      await fetchSolicitudes();
    } catch (err) {
      console.error('Error aprobando solicitud:', err);
      alert(t('admin:error_aprobar', 'Error al aprobar la solicitud.'));
    } finally {
      setState(prev => ({ ...prev, actionLoading: null }));
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt(t('admin:motivo_rechazo', 'Por favor, ingresa el motivo del rechazo:'));
    if (motivo === null) return;

    try {
      setState(prev => ({ ...prev, actionLoading: id }));
      await api.patch(`/adopciones/solicitudes/${id}`, {
        estado: 'rechazada',
        motivo_rechazo: motivo
      });
      await fetchSolicitudes();
    } catch (err) {
      console.error('Error rechazando solicitud:', err);
      alert(t('admin:error_rechazar', 'Error al rechazar la solicitud.'));
    } finally {
      setState(prev => ({ ...prev, actionLoading: null }));
    }
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  if (state.loading) {
    return <LoadingState t={t} />;
  }

  if (state.error) {
    return <ErrorState error={state.error} onRetry={fetchSolicitudes} t={t} />;
  }

  return (
    <div className="as-container">
      <ProfileBannerSection
        name={adminName}
        avatar={adminAvatar}
        stats={stats}
        t={t}
      />

      <StatsSection stats={stats} t={t} />

      <section className="as-list-section">
        <div className="bento-container">
          <div className="as-header">
            <div className="as-header-left">
              <FileText size={20} className="as-header-icon" />
              <h2>{t('admin:solicitudes_titulo', 'Solicitudes de adopción')}</h2>
              <span className="as-badge-count">{stats.total}</span>
            </div>
            <button onClick={handleRefresh} className="as-btn-refresh" disabled={state.refreshing}>
              <RefreshCw size={16} className={state.refreshing ? 'as-spin' : ''} />
              {t('admin:sincronizar', 'Sincronizar')}
            </button>
          </div>

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            estadoOptions={ESTADO_SOLICITUD_OPTIONS}
            t={t}
          />

          {filteredAndSorted.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <SolicitudesTable
                items={paginatedItems}
                onAprobar={handleAprobar}
                onRechazar={handleRechazar}
                onSort={handleSort}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                actionLoading={state.actionLoading}
                t={t}
              />

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSorted.length}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                t={t}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ===== COMPONENTES SECUNDARIOS =====

const LoadingState = ({ t }) => (
  <div className="as-container">
    <div className="as-loading">
      <div className="as-spinner"></div>
      <p>{t('admin:cargando_solicitudes', 'Cargando solicitudes...')}</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry, t }) => (
  <div className="as-container">
    <div className="bento-container">
      <div className="as-error">
        <AlertCircle size={48} className="as-error-icon" />
        <h3>{t('admin:error_carga', 'Error al cargar las solicitudes')}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="as-btn-retry">
          {t('admin:reintentar', 'Reintentar')}
        </button>
      </div>
    </div>
  </div>
);

const ProfileBannerSection = ({ name, avatar, stats, t }) => (
  <div className="as-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('admin:banner_solicitudes_titulo', {
          defaultValue: '{{count}} solicitudes · {{pendientes}} pendientes',
          count: stats.total,
          pendientes: stats.pendientes,
        }),
        solicitudes: stats.total,
        adopciones: stats.aprobadas,
        eventos: stats.pendientes,
      }}
    />
  </div>
);

const StatsSection = ({ stats, t }) => (
  <section className="as-stats-section">
    <div className="bento-container">
      <div className="as-stats-grid">
        <StatCard
          icon={<FileText size={24} />}
          label={t('admin:stats.total_solicitudes', 'Total solicitudes')}
          value={stats.total}
          color="primary"
          subtitle={t('admin:stats.registradas', 'Registradas')}
        />
        <StatCard
          icon={<Clock size={24} />}
          label={t('admin:stats.pendientes', 'Pendientes')}
          value={stats.pendientes}
          color="warning"
          subtitle={t('admin:stats.esperando', 'Esperando revisión')}
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label={t('admin:stats.aprobadas', 'Aprobadas')}
          value={stats.aprobadas}
          color="success"
          subtitle={t('admin:stats.aceptadas', 'Aceptadas')}
        />
        <StatCard
          icon={<XCircle size={24} />}
          label={t('admin:stats.rechazadas', 'Rechazadas')}
          value={stats.rechazadas}
          color="danger"
          subtitle={t('admin:stats.denegadas', 'Denegadas')}
        />
      </div>
    </div>
  </section>
);

// ===== FILTROS =====
const FilterBar = ({ filters, onFilterChange, estadoOptions, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="as-filter-bar">
      <div className="as-filter-group">
        <Search size={16} className="as-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder={t('admin:buscar_solicitud', 'Buscar solicitante o mascota...')}
          className="as-filter-input"
        />
      </div>

      <div className="as-filter-group">
        <Filter size={16} className="as-filter-icon" />
        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="as-filter-select"
        >
          {estadoOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(`admin:estado_${opt.value}`) || opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ===== TABLA =====
const SolicitudesTable = ({
  items,
  onAprobar,
  onRechazar,
  onSort,
  sortBy,
  sortOrder,
  actionLoading,
  t
}) => {
  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: 'as-badge-warning',
      aprobada: 'as-badge-success',
      'Aprobada': 'as-badge-success',
      rechazada: 'as-badge-danger',
      'Rechazada': 'as-badge-danger',
      en_proceso: 'as-badge-info'
    };
    return classes[estado] || 'as-badge-muted';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} className="as-sort-icon-inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => onSort(field)} className="as-sortable-header">
      {children}
      <SortIcon field={field} />
    </th>
  );

  return (
    <div className="as-table-wrapper">
      <table className="as-table">
        <thead>
          <tr>
            <SortableHeader field="nombre_solicitante">{t('admin:solicitante', 'Solicitante')}</SortableHeader>
            <SortableHeader field="mascota">{t('admin:mascota', 'Mascota')}</SortableHeader>
            <SortableHeader field="estado">{t('admin:estado', 'Estado')}</SortableHeader>
            <SortableHeader field="created_at">{t('admin:fecha', 'Fecha')}</SortableHeader>
            <th>{t('admin:mensaje', 'Mensaje')}</th>
            <th>{t('admin:acciones', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((solicitud) => {
            const nombreSolicitante = solicitud.nombre_solicitante || solicitud.nombre || 'N/A';
            const emailSolicitante = solicitud.email_solicitante || solicitud.email || 'N/A';
            const nombreMascota = solicitud.mascota?.nombre_mascota || solicitud.nombre_mascota || 'N/A';
            const mensaje = solicitud.mensaje || solicitud.motivo || 'Sin mensaje';

            return (
              <tr key={solicitud.id} className={actionLoading === solicitud.id ? 'as-row-loading' : ''}>
                <td>
                  <div className="as-solicitante-cell">
                    <User size={16} className="as-solicitante-icon" />
                    <div>
                      <span className="as-solicitante-name">{nombreSolicitante}</span>
                      <span className="as-solicitante-email">
                        <Mail size={12} /> {emailSolicitante}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="as-mascota-cell">
                    <PawPrint size={16} className="as-mascota-icon" />
                    <span>{nombreMascota}</span>
                  </div>
                </td>
                <td>
                  <span className={`as-status-badge ${getEstadoClass(solicitud.estado)}`}>
                    {solicitud.estado || 'pendiente'}
                  </span>
                </td>
                <td>
                  <div className="as-date-cell">
                    {solicitud.created_at ? new Date(solicitud.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td>
                  <div className="as-mensaje-cell" title={mensaje}>
                    {mensaje.length > 50 ? mensaje.substring(0, 50) + '...' : mensaje}
                  </div>
                </td>
                <td>
                  <div className="as-actions-cell">
                    {solicitud.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => onAprobar(solicitud.id)}
                          className="as-action-btn as-btn-approve"
                          title={t('admin:aprobar')}
                          disabled={actionLoading !== null}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => onRechazar(solicitud.id)}
                          className="as-action-btn as-btn-reject"
                          title={t('admin:rechazar')}
                          disabled={actionLoading !== null}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ===== PAGINACIÓN =====
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, t }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="as-pagination">
      <div className="as-pagination-info">
        {t('admin:mostrando', 'Mostrando')} {startItem} - {endItem} {t('admin:de', 'de')} {totalItems}
      </div>
      <div className="as-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="as-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`as-pagination-btn ${page === currentPage ? 'as-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="as-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="as-empty-state">
    <FileText size={48} className="as-empty-icon" />
    <h3>{t('admin:sin_solicitudes', 'No hay solicitudes')}</h3>
    <p>{t('admin:sin_solicitudes_desc', 'Las solicitudes de adopción aparecerán aquí.')}</p>
  </div>
);

export default AdopcionesSolicitudes;