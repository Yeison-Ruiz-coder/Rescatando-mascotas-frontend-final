// src/pages/admin/adopciones/AdopcionesSeguimientos.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import {
  Heart,
  User,
  Calendar,
  Clock,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  PawPrint,
  FileText
} from 'lucide-react';
import './AdopcionesSeguimientos.css';

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const ESTADO_SEGUIMIENTO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completado', label: 'Completado' }
];

// ===== COMPONENTE PRINCIPAL =====
const AdopcionesSeguimientos = () => {
  const { t } = useTranslation(['admin', 'mascotas']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    seguimientos: [],
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
    const total = state.seguimientos.length;
    const pendientes = state.seguimientos.filter(s => s.estado === 'pendiente' || s.estado === 'Pendiente').length;
    const enProgreso = state.seguimientos.filter(s => s.estado === 'en_progreso' || s.estado === 'En progreso').length;
    const completados = state.seguimientos.filter(s => s.estado === 'completado' || s.estado === 'Completado').length;
    return { total, pendientes, enProgreso, completados };
  }, [state.seguimientos]);

  // ===== FILTROS Y ORDENAMIENTO =====
  const filteredAndSorted = useMemo(() => {
    let result = [...state.seguimientos];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s =>
        (s.adoptante?.nombre || s.nombre_adoptante || '').toLowerCase().includes(searchLower) ||
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
  }, [state.seguimientos, filters]);

  const paginatedItems = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, pagination]);

  const totalPages = Math.ceil(filteredAndSorted.length / pagination.itemsPerPage);

  // ===== FUNCIONES =====
  const fetchSeguimientos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.get('/adopciones/seguimientos', {
        params: {
          page: pagination.currentPage,
          per_page: ITEMS_PER_PAGE,
          sort: '-created_at'
        }
      });

      let seguimientosData = [];
      if (response.data?.data?.data) {
        seguimientosData = response.data.data.data;
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.data.current_page || 1,
          itemsPerPage: response.data.data.per_page || ITEMS_PER_PAGE
        }));
      } else if (response.data?.data) {
        seguimientosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        seguimientosData = response.data;
      }

      setState(prev => ({
        ...prev,
        seguimientos: seguimientosData,
        error: null
      }));
    } catch (err) {
      console.error('Error cargando seguimientos:', err);
      setState(prev => ({
        ...prev,
        seguimientos: getSampleSeguimientos(),
        error: null
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [pagination.currentPage]);

  const getSampleSeguimientos = () => {
    return [
      {
        id: 1,
        adoptante: { nombre: 'Carlos Méndez', email: 'carlos@example.com' },
        mascota: { nombre_mascota: 'Luna' },
        fecha_seguimiento: '2026-06-10',
        estado: 'pendiente',
        notas: 'Visita de seguimiento programada para revisar adaptación.',
        created_at: '2026-06-10 10:00:00'
      },
      {
        id: 2,
        adoptante: { nombre: 'Sofía Ramírez', email: 'sofia@example.com' },
        mascota: { nombre_mascota: 'Milo' },
        fecha_seguimiento: '2026-05-28',
        estado: 'completado',
        notas: 'El gato se adaptó bien a la familia y a otros felinos.',
        created_at: '2026-05-28 14:30:00'
      },
      {
        id: 3,
        adoptante: { nombre: 'Andrés López', email: 'andres@example.com' },
        mascota: { nombre_mascota: 'Nala' },
        fecha_seguimiento: '2026-06-08',
        estado: 'en_progreso',
        notas: 'Se revisará la alimentación y la socialización en dos semanas.',
        created_at: '2026-06-08 09:15:00'
      }
    ];
  };

  useEffect(() => {
    fetchSeguimientos();
  }, [fetchSeguimientos]);

  const handleRefresh = () => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchSeguimientos();
  };

  const handleCompletar = async (id) => {
    if (!window.confirm(t('admin:confirmar_completar', '¿Confirmas que este seguimiento está completado?'))) return;
    try {
      setState(prev => ({ ...prev, actionLoading: id }));
      await api.patch(`/adopciones/seguimientos/${id}`, { estado: 'completado' });
      await fetchSeguimientos();
    } catch (err) {
      console.error('Error completando seguimiento:', err);
      alert(t('admin:error_completar', 'Error al completar el seguimiento.'));
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
    return <ErrorState error={state.error} onRetry={fetchSeguimientos} t={t} />;
  }

  return (
    <div className="ase-container">
      <ProfileBannerSection
        name={adminName}
        avatar={adminAvatar}
        stats={stats}
        t={t}
      />

      <StatsSection stats={stats} t={t} />

      <section className="ase-list-section">
        <div className="bento-container">
          <div className="ase-header">
            <div className="ase-header-left">
              <Heart size={20} className="ase-header-icon" />
              <h2>{t('admin:seguimientos_titulo', 'Seguimientos de adopción')}</h2>
              <span className="ase-badge-count">{stats.total}</span>
            </div>
            <button onClick={handleRefresh} className="ase-btn-refresh" disabled={state.refreshing}>
              <RefreshCw size={16} className={state.refreshing ? 'ase-spin' : ''} />
              {t('admin:sincronizar', 'Sincronizar')}
            </button>
          </div>

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            estadoOptions={ESTADO_SEGUIMIENTO_OPTIONS}
            t={t}
          />

          {filteredAndSorted.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <SeguimientosTable
                items={paginatedItems}
                onCompletar={handleCompletar}
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
  <div className="ase-container">
    <div className="ase-loading">
      <div className="ase-spinner"></div>
      <p>{t('admin:cargando_seguimientos', 'Cargando seguimientos...')}</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry, t }) => (
  <div className="ase-container">
    <div className="bento-container">
      <div className="ase-error">
        <AlertCircle size={48} className="ase-error-icon" />
        <h3>{t('admin:error_carga', 'Error al cargar los seguimientos')}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="ase-btn-retry">
          {t('admin:reintentar', 'Reintentar')}
        </button>
      </div>
    </div>
  </div>
);

const ProfileBannerSection = ({ name, avatar, stats, t }) => (
  <div className="ase-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('admin:banner_seguimientos_titulo', {
          defaultValue: '{{count}} seguimientos · {{pendientes}} pendientes',
          count: stats.total,
          pendientes: stats.pendientes,
        }),
        solicitudes: stats.total,
        adopciones: stats.completados,
        eventos: stats.pendientes,
      }}
    />
  </div>
);

const StatsSection = ({ stats, t }) => (
  <section className="ase-stats-section">
    <div className="bento-container">
      <div className="ase-stats-grid">
        <StatCard
          icon={<Heart size={24} />}
          label={t('admin:stats.total_seguimientos', 'Total seguimientos')}
          value={stats.total}
          color="primary"
          subtitle={t('admin:stats.registrados', 'Registrados')}
        />
        <StatCard
          icon={<Clock size={24} />}
          label={t('admin:stats.pendientes', 'Pendientes')}
          value={stats.pendientes}
          color="warning"
          subtitle={t('admin:stats.esperando', 'Esperando')}
        />
        <StatCard
          icon={<FileText size={24} />}
          label={t('admin:stats.en_progreso', 'En progreso')}
          value={stats.enProgreso}
          color="info"
          subtitle={t('admin:stats.activos', 'Activos')}
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label={t('admin:stats.completados', 'Completados')}
          value={stats.completados}
          color="success"
          subtitle={t('admin:stats.finalizados', 'Finalizados')}
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
    <div className="ase-filter-bar">
      <div className="ase-filter-group">
        <Search size={16} className="ase-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder={t('admin:buscar_seguimiento', 'Buscar adoptante o mascota...')}
          className="ase-filter-input"
        />
      </div>

      <div className="ase-filter-group">
        <Filter size={16} className="ase-filter-icon" />
        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="ase-filter-select"
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
const SeguimientosTable = ({
  items,
  onCompletar,
  onSort,
  sortBy,
  sortOrder,
  actionLoading,
  t
}) => {
  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: 'ase-badge-warning',
      'Pendiente': 'ase-badge-warning',
      en_progreso: 'ase-badge-info',
      'En progreso': 'ase-badge-info',
      completado: 'ase-badge-success',
      'Completado': 'ase-badge-success'
    };
    return classes[estado] || 'ase-badge-muted';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} className="ase-sort-icon-inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => onSort(field)} className="ase-sortable-header">
      {children}
      <SortIcon field={field} />
    </th>
  );

  return (
    <div className="ase-table-wrapper">
      <table className="ase-table">
        <thead>
          <tr>
            <SortableHeader field="adoptante">{t('admin:adoptante', 'Adoptante')}</SortableHeader>
            <SortableHeader field="mascota">{t('admin:mascota', 'Mascota')}</SortableHeader>
            <SortableHeader field="estado">{t('admin:estado', 'Estado')}</SortableHeader>
            <SortableHeader field="fecha_seguimiento">{t('admin:fecha', 'Fecha')}</SortableHeader>
            <th>{t('admin:notas', 'Notas')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((seguimiento) => {
            const nombreAdoptante = seguimiento.adoptante?.nombre || seguimiento.nombre_adoptante || 'N/A';
            const nombreMascota = seguimiento.mascota?.nombre_mascota || seguimiento.nombre_mascota || 'N/A';
            const notas = seguimiento.notas || 'Sin notas';
            const fecha = seguimiento.fecha_seguimiento || seguimiento.created_at;

            return (
              <tr key={seguimiento.id} className={actionLoading === seguimiento.id ? 'ase-row-loading' : ''}>
                <td>
                  <div className="ase-adoptante-cell">
                    <User size={16} className="ase-adoptante-icon" />
                    <div>
                      <span className="ase-adoptante-name">{nombreAdoptante}</span>
                      {seguimiento.adoptante?.email && (
                        <span className="ase-adoptante-email">{seguimiento.adoptante.email}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="ase-mascota-cell">
                    <PawPrint size={16} className="ase-mascota-icon" />
                    <span>{nombreMascota}</span>
                  </div>
                </td>
                <td>
                  <span className={`ase-status-badge ${getEstadoClass(seguimiento.estado)}`}>
                    {seguimiento.estado || 'pendiente'}
                  </span>
                </td>
                <td>
                  <div className="ase-date-cell">
                    <Calendar size={14} />
                    <span>{fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <div className="ase-notas-cell" title={notas}>
                    {notas.length > 60 ? notas.substring(0, 60) + '...' : notas}
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
    <div className="ase-pagination">
      <div className="ase-pagination-info">
        {t('admin:mostrando', 'Mostrando')} {startItem} - {endItem} {t('admin:de', 'de')} {totalItems}
      </div>
      <div className="ase-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ase-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`ase-pagination-btn ${page === currentPage ? 'ase-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ase-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="ase-empty-state">
    <Heart size={48} className="ase-empty-icon" />
    <h3>{t('admin:sin_seguimientos', 'No hay seguimientos')}</h3>
    <p>{t('admin:sin_seguimientos_desc', 'Los seguimientos de adopción aparecerán aquí.')}</p>
  </div>
);

export default AdopcionesSeguimientos;