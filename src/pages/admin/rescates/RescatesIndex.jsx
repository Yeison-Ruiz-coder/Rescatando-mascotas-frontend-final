// src/pages/admin/rescates/RescatesIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import { getImageUrl } from '../../../utils/imageUtils';
import {
  AlertCircle,
  FolderHeart,
  History,
  ShieldCheck,
  MapPin,
  Clock,
  RefreshCw,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';
import './RescatesIndex.css';

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'completado', label: 'Completado' },
  { value: 'rechazado', label: 'Rechazado' }
];

const PRIORIDAD_OPTIONS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' }
];

// ===== COMPONENTE PRINCIPAL =====
const RescatesIndex = () => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ===== ESTADO =====
  const [state, setState] = useState({
    rescates: [],
    loading: true,
    refreshing: false,
    error: null
  });

  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    prioridad: 'todos',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // ===== MEMOIZACIÓN =====
  const stats = useMemo(() => {
    const total = state.rescates.length;
    const pendientes = state.rescates.filter(r => 
      r.estado === 'pendiente' || r.estado === 'en_progreso'
    ).length;
    const aprobados = state.rescates.filter(r => 
      r.estado === 'aprobado'
    ).length;
    const completados = state.rescates.filter(r => 
      r.estado === 'completado'
    ).length;
    const tasaEfectividad = total > 0 ? Math.round((completados / total) * 100) : 0;
    return { total, pendientes, aprobados, completados, tasaEfectividad };
  }, [state.rescates]);

  const filteredAndSortedRescates = useMemo(() => {
    let result = [...state.rescates];

    // Búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(r => 
        (r.titulo || '').toLowerCase().includes(searchLower) ||
        (r.lugar_rescate || '').toLowerCase().includes(searchLower) ||
        (r.descripcion_rescate || '').toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado !== 'todos') {
      result = result.filter(r => r.estado === filters.estado);
    }

    // Filtro por prioridad
    if (filters.prioridad !== 'todos') {
      result = result.filter(r => r.prioridad === filters.prioridad);
    }

    // Ordenamiento
    result.sort((a, b) => {
      const aVal = a[filters.sortBy] || '';
      const bVal = b[filters.sortBy] || '';
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [state.rescates, filters]);

  // Paginación
  const paginatedRescates = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredAndSortedRescates.slice(start, end);
  }, [filteredAndSortedRescates, pagination]);

  const totalPages = Math.ceil(filteredAndSortedRescates.length / pagination.itemsPerPage);

  // ===== FUNCIONES =====
  const fetchRescatesGlobal = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await rescateService.getAllRescatesAdmin();
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          rescates: response.data.data.data || [],
          error: null
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || t('errors.general')
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [t]);

  useEffect(() => {
    fetchRescatesGlobal();
  }, [fetchRescatesGlobal]);

  const handleRefresh = () => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchRescatesGlobal();
  };

  const handleVerDetalle = (id) => navigate(`/admin/rescates/${id}`);
  const irAPendientes = () => navigate('/admin/rescates/pendientes');
  const irAMapa = () => navigate('/admin/rescates/mapa');

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
    return <ErrorState error={state.error} onRetry={fetchRescatesGlobal} t={t} />;
  }

  return (
    <div className="ri-container">
      <ProfileBannerSection
        name={adminName}
        avatar={adminAvatar}
        stats={stats}
        t={t}
      />

      <StatsSection
        stats={stats}
        onPendientes={irAPendientes}
        onMapa={irAMapa}
        t={t}
      />

      <section className="ri-list-section">
        <div className="bento-container">
          <div className="ri-header">
            <div className="ri-header-left">
              <FolderHeart size={20} className="ri-header-icon" />
              <h2>{t('monitoreo_global', 'Monitoreo Global de Rescates')}</h2>
              <span className="ri-badge-count">{stats.total}</span>
            </div>
            <button onClick={handleRefresh} className="ri-btn-refresh" disabled={state.refreshing}>
              <RefreshCw size={16} className={state.refreshing ? 'ri-spin' : ''} />
              {t('sincronizar', 'Sincronizar')}
            </button>
          </div>

          {/* Filtros */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            estadoOptions={ESTADO_OPTIONS}
            prioridadOptions={PRIORIDAD_OPTIONS}
            t={t}
          />

          {filteredAndSortedRescates.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <RescatesTable
                rescates={paginatedRescates}
                onVerDetalle={handleVerDetalle}
                onSort={handleSort}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                t={t}
              />

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedRescates.length}
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
  <div className="ri-container">
    <div className="ri-loading">
      <div className="ri-spinner"></div>
      <p>{t('cargando_rescates', 'Cargando panel de rescates...')}</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry, t }) => (
  <div className="ri-container">
    <div className="bento-container">
      <div className="ri-error">
        <AlertCircle size={48} className="ri-error-icon" />
        <h3>{t('error_carga', 'Error al cargar los rescates')}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="ri-btn-retry">
          {t('reintentar', 'Reintentar')}
        </button>
      </div>
    </div>
  </div>
);

const ProfileBannerSection = ({ name, avatar, stats, t }) => (
  <div className="ri-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('banner.titulo_admin', {
          defaultValue: 'Panel de Administración · {{count}} Casos Reportados',
          count: stats.total,
        }),
        solicitudes: stats.total,
        adopciones: stats.completados,
        eventos: stats.pendientes,
      }}
    />
  </div>
);

const StatsSection = ({ stats, onPendientes, onMapa, t }) => (
  <section className="ri-stats-section">
    <div className="bento-container">
      <div className="ri-stats-grid">
        <StatCard
          icon={<History size={24} />}
          label={t('stats.total_casos', 'Casos Totales')}
          value={stats.total}
          color="primary"
          subtitle={t('estadistica', 'Estadística')}
        />
        <StatCard
          icon={<Clock size={24} />}
          label={t('stats.pendientes', 'Pendientes')}
          value={stats.pendientes}
          color="danger"
          subtitle={t('click_para_ver', 'Click para ver')}
          onClick={onPendientes}
          isAction
        />
        <StatCard
          icon={<ShieldCheck size={24} />}
          label={t('stats.tasa_cierre', 'Tasa de Cierre')}
          value={`${stats.tasaEfectividad}%`}
          color="info"
          subtitle={t('efectividad', 'Efectividad')}
        />
        <StatCard
          icon={<MapPin size={24} />}
          label={t('stats.geovisor', 'Ver Geovisor')}
          value={t('mapa', 'Mapa')}
          color="success"
          subtitle={t('click_para_abrir', 'Click para abrir')}
          onClick={onMapa}
          isAction
        />
      </div>
    </div>
  </section>
);

// ===== FILTROS =====
const FilterBar = ({ filters, onFilterChange, estadoOptions, prioridadOptions, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="ri-filter-bar">
      <div className="ri-filter-group">
        <Search size={16} className="ri-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder={t('buscar_rescates', 'Buscar rescates...')}
          className="ri-filter-input"
        />
      </div>

      <div className="ri-filter-group">
        <Filter size={16} className="ri-filter-icon" />
        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="ri-filter-select"
        >
          <option value="todos">{t('todos_estados', 'Todos los estados')}</option>
          {estadoOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(`estado_${opt.value}`) || opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ri-filter-group">
        <select
          name="prioridad"
          value={filters.prioridad}
          onChange={handleChange}
          className="ri-filter-select"
        >
          <option value="todos">{t('todas_prioridades', 'Todas las prioridades')}</option>
          {prioridadOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(`prioridad_${opt.value}`) || opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ===== TABLA =====
const RescatesTable = ({ rescates, onVerDetalle, onSort, sortBy, sortOrder, t }) => {
  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: 'ri-badge-danger',
      en_progreso: 'ri-badge-warning',
      aprobado: 'ri-badge-success',
      completado: 'ri-badge-success',
      rechazado: 'ri-badge-muted'
    };
    return classes[estado] || 'ri-badge-muted';
  };

  const getPrioridadClass = (prioridad) => {
    const classes = {
      alta: 'ri-priority-high',
      media: 'ri-priority-medium',
      baja: 'ri-priority-low'
    };
    return classes[prioridad] || 'ri-priority-medium';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} className="ri-sort-icon-inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => onSort(field)} className="ri-sortable-header">
      {children}
      <SortIcon field={field} />
    </th>
  );

  return (
    <div className="ri-table-wrapper">
      <table className="ri-table">
        <thead>
          <tr>
            <SortableHeader field="titulo">{t('titulo', 'Título')}</SortableHeader>
            <SortableHeader field="lugar_rescate">{t('ubicacion', 'Ubicación')}</SortableHeader>
            <SortableHeader field="prioridad">{t('prioridad', 'Prioridad')}</SortableHeader>
            <SortableHeader field="estado">{t('estado', 'Estado')}</SortableHeader>
            <SortableHeader field="created_at">{t('fecha', 'Fecha')}</SortableHeader>
            <th className="text-center">{t('acciones', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody>
          {rescates.map((rescate) => (
            <tr key={rescate.id}>
              <td>
                <div className="ri-animal-cell">
                  {rescate.foto_principal ? (
                    <img
                      src={getImageUrl(rescate.foto_principal)}
                      alt={rescate.titulo}
                      className="ri-animal-img"
                    />
                  ) : (
                    <div className="ri-animal-no-img">📷</div>
                  )}
                  <div>
                    <span className="ri-animal-title">
                      {rescate.titulo || rescate.lugar_rescate || t('sin_titulo')}
                    </span>
                    <span className="ri-animal-sub">
                      {t('reportado_por')}: {rescate.nombre_reportante || t('anonimo')}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="ri-location-cell">
                  <MapPin size={14} />
                  <span>{rescate.lugar_rescate || 'N/A'}</span>
                </div>
              </td>
              <td>
                <span className={`ri-priority-badge ${getPrioridadClass(rescate.prioridad)}`}>
                  {t(`prioridad_${rescate.prioridad}`) || rescate.prioridad}
                </span>
              </td>
              <td>
                <span className={`ri-status-badge ${getEstadoClass(rescate.estado)}`}>
                  {t(`estado_${rescate.estado}`) || rescate.estado}
                </span>
              </td>
              <td>
                <div className="ri-date-cell">
                  {rescate.created_at ? new Date(rescate.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </td>
              <td>
                <div className="ri-actions-cell">
                  <button
                    onClick={() => onVerDetalle(rescate.id)}
                    className="ri-action-btn"
                    title={t('ver_detalle')}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
    <div className="ri-pagination">
      <div className="ri-pagination-info">
        {t('mostrando', 'Mostrando')} {startItem} - {endItem} {t('de', 'de')} {totalItems}
      </div>
      <div className="ri-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ri-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`ri-pagination-btn ${page === currentPage ? 'ri-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ri-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="ri-empty-state">
    <FolderHeart size={48} className="ri-empty-icon" />
    <h3>{t('no_reportes', 'No hay reportes en el sistema')}</h3>
    <p>{t('no_reportes_desc', 'Las solicitudes de la ciudadanía aparecerán listadas aquí.')}</p>
  </div>
);

export default RescatesIndex;