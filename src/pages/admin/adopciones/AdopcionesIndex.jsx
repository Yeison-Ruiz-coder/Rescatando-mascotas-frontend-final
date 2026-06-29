// src/pages/admin/adopciones/AdopcionesIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import { getImageUrl } from '../../../utils/imageUtils';
import {
  Heart,
  PawPrint,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Calendar,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import './AdopcionesIndex.css';

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'En adopcion', label: 'En adopción' },
  { value: 'Adoptado', label: 'Adoptado' },
  { value: 'Rescatada', label: 'Rescatada' },
  { value: 'En acogida', label: 'En acogida' }
];

const ESPECIE_OPTIONS = [
  { value: '', label: 'Todas las especies' },
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Conejo', label: 'Conejo' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Otro', label: 'Otro' }
];

// ===== COMPONENTE PRINCIPAL =====
const AdopcionesIndex = () => {
  const { t } = useTranslation(['admin', 'mascotas']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    mascotas: [],
    loading: true,
    refreshing: false,
    error: null
  });

  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    especie: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // ===== FUNCIÓN PARA OBTENER URL DE IMAGEN SEGURA =====
  const getImageUrlSafe = useCallback((path) => {
    if (!path) return null;
    
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
      return path;
    }
    
    if (typeof path === 'string') {
      return getImageUrl(path);
    }
    
    return null;
  }, []);

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = state.mascotas.length;
    const enAdopcion = state.mascotas.filter(m => 
      m.estado === 'En adopcion' || m.estado === 'En adopción'
    ).length;
    const adoptados = state.mascotas.filter(m => 
      m.estado === 'Adoptado'
    ).length;
    const enAcogida = state.mascotas.filter(m => 
      m.estado === 'En acogida'
    ).length;
    const tasaAdopcion = total > 0 ? Math.round((adoptados / total) * 100) : 0;
    return { total, enAdopcion, adoptados, enAcogida, tasaAdopcion };
  }, [state.mascotas]);

  // ===== FILTROS Y ORDENAMIENTO =====
  const filteredAndSorted = useMemo(() => {
    let result = [...state.mascotas];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m => 
        (m.nombre_mascota || '').toLowerCase().includes(searchLower) ||
        (m.especie || '').toLowerCase().includes(searchLower) ||
        (m.lugar_rescate || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.estado) {
      result = result.filter(m => m.estado === filters.estado);
    }

    if (filters.especie) {
      result = result.filter(m => m.especie === filters.especie);
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
  }, [state.mascotas, filters]);

  const paginatedItems = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, pagination]);

  const totalPages = Math.ceil(filteredAndSorted.length / pagination.itemsPerPage);

  // ===== FUNCIONES =====
  const fetchMascotas = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.get('/mascotas', {
        params: {
          page: pagination.currentPage,
          per_page: ITEMS_PER_PAGE,
          sort: '-created_at',
          estado: 'En adopcion,En adopción'
        }
      });

      let mascotasData = [];
      if (response.data?.data?.data) {
        mascotasData = response.data.data.data;
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.data.current_page || 1,
          itemsPerPage: response.data.data.per_page || ITEMS_PER_PAGE
        }));
      } else if (response.data?.data) {
        mascotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        mascotasData = response.data;
      }

      setState(prev => ({
        ...prev,
        mascotas: mascotasData,
        error: null
      }));
    } catch (err) {
      console.error('Error cargando adopciones:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || t('admin:error_carga_adopciones', 'Error al cargar las adopciones')
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [pagination.currentPage, t]);

  useEffect(() => {
    fetchMascotas();
  }, [fetchMascotas]);

  const handleRefresh = () => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchMascotas();
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
    return <ErrorState error={state.error} onRetry={fetchMascotas} t={t} />;
  }

  return (
    <div className="ad-container">
      <ProfileBannerSection
        name={adminName}
        avatar={adminAvatar}
        stats={stats}
        t={t}
      />

      <StatsSection stats={stats} t={t} />

      <section className="ad-list-section">
        <div className="bento-container">
          <div className="ad-header">
            <div className="ad-header-left">
              <Heart size={20} className="ad-header-icon" />
              <h2>{t('admin:adopciones_titulo', 'Mascotas en adopción')}</h2>
              <span className="ad-badge-count">{stats.total}</span>
            </div>
            <button onClick={handleRefresh} className="ad-btn-refresh" disabled={state.refreshing}>
              <RefreshCw size={16} className={state.refreshing ? 'ad-spin' : ''} />
              {t('admin:sincronizar', 'Sincronizar')}
            </button>
          </div>

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            estadoOptions={ESTADO_OPTIONS}
            especieOptions={ESPECIE_OPTIONS}
            t={t}
          />

          {filteredAndSorted.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <AdopcionesTable
                items={paginatedItems}
                onSort={handleSort}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                getImageUrlSafe={getImageUrlSafe}
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
  <div className="ad-container">
    <div className="ad-loading">
      <div className="ad-spinner"></div>
      <p>{t('admin:cargando_adopciones', 'Cargando adopciones...')}</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry, t }) => (
  <div className="ad-container">
    <div className="bento-container">
      <div className="ad-error">
        <AlertCircle size={48} className="ad-error-icon" />
        <h3>{t('admin:error_carga', 'Error al cargar las adopciones')}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="ad-btn-retry">
          {t('admin:reintentar', 'Reintentar')}
        </button>
      </div>
    </div>
  </div>
);

const ProfileBannerSection = ({ name, avatar, stats, t }) => (
  <div className="ad-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('admin:banner_adopciones_titulo', {
          defaultValue: '{{count}} mascotas en adopción · {{percent}}% adoptadas',
          count: stats.total,
          percent: stats.tasaAdopcion,
        }),
        solicitudes: stats.total,
        adopciones: stats.adoptados,
        eventos: stats.enAdopcion,
      }}
    />
  </div>
);

const StatsSection = ({ stats, t }) => (
  <section className="ad-stats-section">
    <div className="bento-container">
      <div className="ad-stats-grid">
        <StatCard
          icon={<Heart size={24} />}
          label={t('admin:stats.total_mascotas', 'Total mascotas')}
          value={stats.total}
          color="primary"
          subtitle={t('admin:stats.registradas', 'Registradas')}
        />
        <StatCard
          icon={<PawPrint size={24} />}
          label={t('admin:stats.en_adopcion', 'En adopción')}
          value={stats.enAdopcion}
          color="success"
          subtitle={t('admin:stats.disponibles', 'Disponibles')}
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label={t('admin:stats.adoptados', 'Adoptados')}
          value={stats.adoptados}
          color="info"
          subtitle={t('admin:stats.completados', 'Completados')}
        />
        <StatCard
          icon={<Clock size={24} />}
          label={t('admin:stats.en_acogida', 'En acogida')}
          value={stats.enAcogida}
          color="warning"
          subtitle={t('admin:stats.temporales', 'Temporales')}
        />
      </div>
    </div>
  </section>
);

// ===== FILTROS =====
const FilterBar = ({ filters, onFilterChange, estadoOptions, especieOptions, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="ad-filter-bar">
      <div className="ad-filter-group">
        <Search size={16} className="ad-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder={t('admin:buscar_mascota', 'Buscar mascota...')}
          className="ad-filter-input"
        />
      </div>

      <div className="ad-filter-group">
        <Filter size={16} className="ad-filter-icon" />
        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="ad-filter-select"
        >
          {estadoOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(`mascotas:${opt.value}`) || opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ad-filter-group">
        <select
          name="especie"
          value={filters.especie}
          onChange={handleChange}
          className="ad-filter-select"
        >
          {especieOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ===== TABLA =====
const AdopcionesTable = ({ items, onSort, sortBy, sortOrder, getImageUrlSafe, t }) => {
  const getEstadoClass = (estado) => {
    const classes = {
      'En adopcion': 'ad-badge-success',
      'En adopción': 'ad-badge-success',
      'Adoptado': 'ad-badge-info',
      'Rescatada': 'ad-badge-warning',
      'En acogida': 'ad-badge-primary'
    };
    return classes[estado] || 'ad-badge-muted';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} className="ad-sort-icon-inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => onSort(field)} className="ad-sortable-header">
      {children}
      <SortIcon field={field} />
    </th>
  );

  return (
    <div className="ad-table-wrapper">
      <table className="ad-table">
        <thead>
          <tr>
            <SortableHeader field="nombre_mascota">{t('admin:mascota', 'Mascota')}</SortableHeader>
            <SortableHeader field="especie">{t('admin:especie', 'Especie')}</SortableHeader>
            <SortableHeader field="estado">{t('admin:estado', 'Estado')}</SortableHeader>
            <SortableHeader field="lugar_rescate">{t('admin:ubicacion', 'Ubicación')}</SortableHeader>
            <SortableHeader field="created_at">{t('admin:registro', 'Registro')}</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {items.map((mascota) => {
            let fotoUrl = null;
            if (mascota.foto_principal) {
              fotoUrl = getImageUrlSafe(mascota.foto_principal);
            }

            return (
              <tr key={mascota.id}>
                <td>
                  <div className="ad-animal-cell">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={mascota.nombre_mascota}
                        className="ad-animal-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="ad-animal-no-img">📷</div>
                    )}
                    <div>
                      <span className="ad-animal-title">
                        {mascota.nombre_mascota || t('admin:sin_nombre', 'Sin nombre')}
                      </span>
                      <span className="ad-animal-sub">
                        {mascota.genero || '-'} · {mascota.edad_aprox ? `${mascota.edad_aprox} años` : '-'}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ad-especie-badge">
                    {mascota.especie || '-'}
                  </span>
                </td>
                <td>
                  <span className={`ad-status-badge ${getEstadoClass(mascota.estado)}`}>
                    {mascota.estado || '-'}
                  </span>
                </td>
                <td>
                  <div className="ad-location-cell">
                    <MapPin size={14} />
                    <span>{mascota.lugar_rescate || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <div className="ad-date-cell">
                    {mascota.created_at ? new Date(mascota.created_at).toLocaleDateString() : 'N/A'}
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
    <div className="ad-pagination">
      <div className="ad-pagination-info">
        {t('admin:mostrando', 'Mostrando')} {startItem} - {endItem} {t('admin:de', 'de')} {totalItems}
      </div>
      <div className="ad-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ad-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`ad-pagination-btn ${page === currentPage ? 'ad-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ad-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="ad-empty-state">
    <Heart size={48} className="ad-empty-icon" />
    <h3>{t('admin:sin_mascotas', 'No hay mascotas en adopción')}</h3>
    <p>{t('admin:sin_mascotas_desc', 'Las mascotas disponibles para adopción aparecerán aquí.')}</p>
  </div>
);

export default AdopcionesIndex;