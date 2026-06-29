// src/pages/admin/rescates/RescatesPendientes.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import { getImageUrl } from '../../../utils/imageUtils';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  Clock, 
  MapPin, 
  ArrowLeft,
  MessageSquare,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  User,
  RefreshCw
} from 'lucide-react';
import './RescatesPendientes.css';

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const PRIORIDAD_OPTIONS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' }
];

const RescatesPendientes = () => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    prioridad: 'todos',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = pendientes.length;
    const alta = pendientes.filter(r => r.prioridad === 'alta').length;
    const media = pendientes.filter(r => r.prioridad === 'media').length;
    const baja = pendientes.filter(r => r.prioridad === 'baja').length;
    return { total, alta, media, baja };
  }, [pendientes]);

  // ===== FILTROS Y ORDENAMIENTO =====
  const filteredAndSorted = useMemo(() => {
    let result = [...pendientes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(r => 
        (r.titulo || '').toLowerCase().includes(searchLower) ||
        (r.lugar_rescate || '').toLowerCase().includes(searchLower) ||
        (r.descripcion_rescate || '').toLowerCase().includes(searchLower) ||
        (r.nombre_reportante || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.prioridad !== 'todos') {
      result = result.filter(r => r.prioridad === filters.prioridad);
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
  }, [pendientes, filters]);

  const paginatedItems = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, pagination]);

  const totalPages = Math.ceil(filteredAndSorted.length / pagination.itemsPerPage);
  const conteoPendientes = pendientes.length;

  // ===== FUNCIONES =====
  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rescateService.getPendientesAdmin();
      
      if (response?.data?.success) {
        const dataExtraida = response.data.data?.data || response.data.data;
        setPendientes(Array.isArray(dataExtraida) ? dataExtraida : []);
      } else {
        setError(response?.data?.message || t('errors.load_pendientes'));
        setPendientes([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.load_pendientes'));
      setPendientes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendientes();
  };

  const handleAprobar = async (id) => {
    if (!window.confirm(t('confirm_aprobar', '¿Confirmas que este reporte es válido?'))) return;
    try {
      setActionLoading(id);
      await rescateService.aprobarRescate(id);
      setPendientes(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(t('errors.approve_failed', 'Error al aprobar el reporte.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt(t('motivo_rechazo', 'Por favor, ingresa el motivo del rechazo:'));
    if (motivo === null) return;
    
    try {
      setActionLoading(id);
      await rescateService.rechazarRescate(id, { motivo });
      setPendientes(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(t('errors.reject_failed', 'Error al rechazar el reporte.'));
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return (
      <div className="rp-container">
        <div className="rp-loading">
          <div className="rp-spinner"></div>
          <p>{t('cargando_pendientes', 'Cargando cola de revisión...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-container">
      <div className="rp-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_pendientes', {
              defaultValue: '{{count}} alertas pendientes de revisión',
              count: conteoPendientes,
            }),
            solicitudes: conteoPendientes,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <div className="rp-back-header">
          <button onClick={() => navigate('/admin/rescates')} className="rp-btn-back">
            <ArrowLeft size={16} />
            {t('volver_consola', 'Volver a la Consola Principal')}
          </button>
        </div>

        <div className="rp-title-block">
          <div className="rp-title-left">
            <AlertTriangle className="rp-icon-alert" size={28} />
            <div>
              <h2>{t('alertas_evaluar', 'Alertas por Evaluar')}</h2>
              <p>{t('alertas_evaluar_desc', 'Revisa, aprueba o descarta los reportes de animales en situación de riesgo.')}</p>
            </div>
          </div>
          <div className="rp-title-right">
            <span className="rp-counter-badge">{conteoPendientes} {t('casos', 'Casos')}</span>
            <button onClick={handleRefresh} className="rp-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'rp-spin' : ''} />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="rp-stats-grid">
          <StatCard
            icon={<AlertTriangle size={24} />}
            label={t('stats.pendientes', 'Pendientes')}
            value={stats.total}
            color="danger"
            subtitle={t('total_pendientes', 'Total pendientes')}
          />
          <StatCard
            icon={<Clock size={24} />}
            label={t('stats.alta', 'Alta Prioridad')}
            value={stats.alta}
            color="danger"
            subtitle={t('prioridad_alta', 'Alta')}
          />
          <StatCard
            icon={<Filter size={24} />}
            label={t('stats.media', 'Media Prioridad')}
            value={stats.media}
            color="warning"
            subtitle={t('prioridad_media', 'Media')}
          />
          <StatCard
            icon={<Check size={24} />}
            label={t('stats.baja', 'Baja Prioridad')}
            value={stats.baja}
            color="success"
            subtitle={t('prioridad_baja', 'Baja')}
          />
        </div>

        {error && <div className="rp-error-banner">{error}</div>}

        {conteoPendientes === 0 ? (
          <EmptyState t={t} />
        ) : (
          <>
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              prioridadOptions={PRIORIDAD_OPTIONS}
              t={t}
            />

            <PendientesTable
              items={paginatedItems}
              actionLoading={actionLoading}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
              onVerDetalle={(id) => navigate(`/admin/rescates/${id}`)}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
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
    </div>
  );
};

// ===== COMPONENTES SECUNDARIOS =====

const EmptyState = ({ t }) => (
  <div className="rp-empty-state rp-border-dashed">
    <Clock size={48} className="rp-empty-icon" />
    <h3>{t('bandeja_limpia', '¡Bandeja limpia!')}</h3>
    <p>{t('bandeja_limpia_desc', 'No tienes reportes ciudadanos pendientes de validación por el momento.')}</p>
  </div>
);

const FilterBar = ({ filters, onFilterChange, prioridadOptions, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rp-filter-bar">
      <div className="rp-filter-group">
        <Search size={16} className="rp-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder={t('buscar_reporte', 'Buscar reporte...')}
          className="rp-filter-input"
        />
      </div>

      <div className="rp-filter-group">
        <Filter size={16} className="rp-filter-icon" />
        <select
          name="prioridad"
          value={filters.prioridad}
          onChange={handleChange}
          className="rp-filter-select"
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

const PendientesTable = ({
  items,
  actionLoading,
  onAprobar,
  onRechazar,
  onVerDetalle,
  onSort,
  sortBy,
  sortOrder,
  t
}) => {
  const getPrioridadClass = (prioridad) => {
    const classes = {
      alta: 'rp-priority-high',
      media: 'rp-priority-medium',
      baja: 'rp-priority-low'
    };
    return classes[prioridad] || 'rp-priority-medium';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} className="rp-sort-icon-inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => onSort(field)} className="rp-sortable-header">
      {children}
      <SortIcon field={field} />
    </th>
  );

  return (
    <div className="rp-table-wrapper">
      <table className="rp-table">
        <thead>
          <tr>
            <SortableHeader field="titulo">{t('reporte', 'Reporte')}</SortableHeader>
            <SortableHeader field="lugar_rescate">{t('ubicacion', 'Ubicación')}</SortableHeader>
            <SortableHeader field="prioridad">{t('prioridad', 'Prioridad')}</SortableHeader>
            <SortableHeader field="created_at">{t('fecha', 'Fecha')}</SortableHeader>
            <th>{t('acciones', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={actionLoading === item.id ? 'rp-row-loading' : ''}>
              <td>
                <div className="rp-animal-cell">
                  {item.foto_principal ? (
                    <img
                      src={getImageUrl(item.foto_principal)}
                      alt={item.titulo}
                      className="rp-animal-img"
                    />
                  ) : (
                    <div className="rp-animal-no-img">📷</div>
                  )}
                  <div>
                    <span className="rp-animal-title">
                      {item.titulo || item.lugar_rescate || t('sin_titulo')}
                    </span>
                    <span className="rp-reporter">
                      <User size={12} />
                      {t('por', 'Por')}: {item.nombre_reportante || t('anonimo', 'Anónimo')}
                    </span>
                    {item.descripcion_rescate && (
                      <span className="rp-desc-preview">
                        <MessageSquare size={12} />
                        {item.descripcion_rescate.length > 60 
                          ? item.descripcion_rescate.substring(0, 60) + '...' 
                          : item.descripcion_rescate}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className="rp-icon-text">
                  <MapPin size={14} />
                  <span>{item.lugar_rescate || 'Popayán'}</span>
                </div>
              </td>
              <td>
                <span className={`rp-priority-badge ${getPrioridadClass(item.prioridad)}`}>
                  {t(`prioridad_${item.prioridad}`) || item.prioridad}
                </span>
              </td>
              <td>
                <div className="rp-icon-text">
                  <Clock size={14} />
                  <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </td>
              <td>
                <div className="rp-actions-cell">
                  <button
                    onClick={() => onVerDetalle(item.id)}
                    className="rp-action-btn rp-btn-view"
                    title={t('inspeccionar', 'Inspeccionar')}
                    disabled={actionLoading !== null}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onAprobar(item.id)}
                    className="rp-action-btn rp-btn-approve"
                    title={t('validar_publicar', 'Validar y Publicar')}
                    disabled={actionLoading !== null}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => onRechazar(item.id)}
                    className="rp-action-btn rp-btn-reject"
                    title={t('descartar', 'Descartar reporte')}
                    disabled={actionLoading !== null}
                  >
                    <X size={16} />
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
    <div className="rp-pagination">
      <div className="rp-pagination-info">
        {t('mostrando', 'Mostrando')} {startItem} - {endItem} {t('de', 'de')} {totalItems}
      </div>
      <div className="rp-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rp-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rp-pagination-btn ${page === currentPage ? 'rp-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rp-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default RescatesPendientes;