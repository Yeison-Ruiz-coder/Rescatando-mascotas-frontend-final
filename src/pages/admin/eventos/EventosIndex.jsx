// src/pages/admin/eventos/EventosIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader,
  Users,
  Heart,
  MapPin,
  CalendarDays,
  Globe,
  Home,
  Image,
  RefreshCw,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Clock
} from "lucide-react";
import api from "../../../services/api";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import StatCard from "../../../components/common/StatCard/StatCard";
import "./EventosIndex.css";

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Adopción', label: 'Adopción' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Recreación', label: 'Recreación' },
  { value: 'Otro', label: 'Otro' }
];

const TIPO_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'admin', label: 'Global' },
  { value: 'fundacion', label: 'Fundación' }
];

const AdminEventosIndex = () => {
  const { t } = useTranslation("eventos");
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    categoria: '',
    tipo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const getImageUrl = useCallback((url) => buildImageUrl(url), []);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ===== ESTADÍSTICAS =====
  const stats = {
    total: eventos.length,
    proximos: eventos.filter(e => {
      if (!e.fecha_evento) return false;
      return new Date(e.fecha_evento) > new Date();
    }).length,
    pasados: eventos.filter(e => {
      if (!e.fecha_evento) return false;
      return new Date(e.fecha_evento) < new Date();
    }).length,
    esteMes: eventos.filter(e => {
      if (!e.fecha_evento) return false;
      const fecha = new Date(e.fecha_evento);
      const ahora = new Date();
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    }).length
  };

  // ===== APLICAR FILTROS =====
  const applyFilters = useCallback((filters, data) => {
    if (!data || !data.length) {
      setEventosFiltrados([]);
      return;
    }
    
    let resultado = [...data];

    if (filters.search && filters.search.trim()) {
      const busquedaLower = filters.search.toLowerCase().trim();
      resultado = resultado.filter(
        (e) =>
          e.nombre_evento?.toLowerCase().includes(busquedaLower) ||
          e.lugar_evento?.toLowerCase().includes(busquedaLower) ||
          e.categoria?.toLowerCase().includes(busquedaLower) ||
          e.fundacion?.Nombre_1?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filters.categoria && filters.categoria.trim()) {
      resultado = resultado.filter(
        (e) => e.categoria?.toLowerCase() === filters.categoria.toLowerCase()
      );
    }

    if (filters.tipo && filters.tipo.trim()) {
      resultado = resultado.filter(
        (e) => e.tipo === filters.tipo
      );
    }

    setEventosFiltrados(resultado);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // ===== CARGAR EVENTOS =====
  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/eventos?per_page=9999`);

      let eventosData = [];
      let statsData = null;

      if (response.data && response.data.success !== undefined) {
        eventosData = response.data.data?.data || response.data.data || [];
        statsData = response.data.estadisticas || null;
      } else if (response.data && response.data.data) {
        eventosData = response.data.data.data || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      } else {
        eventosData = [];
      }

      const eventosArray = Array.isArray(eventosData)
        ? eventosData
        : eventosData?.data
          ? eventosData.data
          : [];

      setEventos(eventosArray);
      setEstadisticas(statsData);
      applyFilters(currentFilters, eventosArray);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || t("error_load"));
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, currentFilters, applyFilters]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  // Cuando cambian los filtros, reaplicar
  useEffect(() => {
    applyFilters(currentFilters, eventos);
  }, [currentFilters, eventos, applyFilters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEventos();
  };

  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete"))) return;

    setDeletingId(id);
    try {
      await api.delete(`/admin/eventos/${id}`);
      await loadEventos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || t("error_delete"));
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // ===== PAGINACIÓN =====
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedItems = eventosFiltrados.slice(startIndex, endIndex);
  const totalPages = Math.ceil(eventosFiltrados.length / pagination.itemsPerPage);

  if (loading) {
    return (
      <div className="ev-container">
        <div className="ev-loading">
          <div className="ev-spinner"></div>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ev-container">
        <div className="bento-container">
          <div className="ev-error">
            <AlertCircle size={48} className="ev-error-icon" />
            <h3>{t("error_title")}</h3>
            <p>{error}</p>
            <button onClick={loadEventos} className="ev-btn-retry">
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ev-container">
      {/* ===== BANNER ===== */}
      <div className="ev-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo', {
              defaultValue: '{{count}} eventos · {{proximos}} próximos',
              count: stats.total,
              proximos: stats.proximos,
            }),
            solicitudes: stats.total,
            adopciones: stats.proximos,
            eventos: stats.esteMes,
          }}
        />
      </div>

      {/* ===== STATS ===== */}
      <section className="ev-stats-section">
        <div className="bento-container">
          <div className="ev-stats-grid">
            <StatCard
              icon={<Calendar size={24} />}
              label={t('stats.total', 'Total eventos')}
              value={stats.total}
              color="primary"
              subtitle={t('stats.registrados', 'Registrados')}
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.proximos', 'Próximos')}
              value={stats.proximos}
              color="success"
              subtitle={t('stats.por_venir', 'Por venir')}
            />
            <StatCard
              icon={<Calendar size={24} />}
              label={t('stats.pasados', 'Pasados')}
              value={stats.pasados}
              color="muted"
              subtitle={t('stats.finalizados', 'Finalizados')}
            />
            <StatCard
              icon={<Heart size={24} />}
              label={t('stats.este_mes', 'Este mes')}
              value={stats.esteMes}
              color="info"
              subtitle={t('stats.activos', 'Activos')}
            />
          </div>
        </div>
      </section>

      {/* ===== LISTA ===== */}
      <section className="ev-list-section">
        <div className="bento-container">
          <div className="ev-header">
            <div className="ev-header-left">
              <Calendar size={20} className="ev-header-icon" />
              <h2>{t('event_management', 'Gestión de Eventos')}</h2>
              <span className="ev-badge-count">{stats.total}</span>
            </div>
            <div className="ev-header-right">
              <button onClick={handleRefresh} className="ev-btn-refresh" disabled={refreshing}>
                <RefreshCw size={16} className={refreshing ? 'ev-spin' : ''} />
                {t('sincronizar', 'Sincronizar')}
              </button>
              <Link to="/admin/eventos/crear" className="ev-btn-create">
                <Plus size={16} />
                {t('create_event', 'Crear evento')}
              </Link>
            </div>
          </div>

          {/* ===== FILTROS ===== */}
          <FilterBar
            filters={currentFilters}
            onFilterChange={handleFilterChange}
            categoriaOptions={CATEGORIA_OPTIONS}
            tipoOptions={TIPO_OPTIONS}
            t={t}
          />

          {eventosFiltrados.length === 0 ? (
            <div className="ev-empty-state">
              <Calendar size={48} className="ev-empty-icon" />
              <h3>{t("no_events")}</h3>
              <p>{t("no_events_desc")}</p>
            </div>
          ) : (
            <>
              {/* ===== TABLA ===== */}
              <EventosTable
                items={paginatedItems}
                onDelete={handleDelete}
                deletingId={deletingId}
                getImageUrl={getImageUrl}
                t={t}
              />

              {/* ===== PAGINACIÓN ===== */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={totalPages}
                  totalItems={eventosFiltrados.length}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  t={t}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ===== FILTROS =====
const FilterBar = ({ filters, onFilterChange, categoriaOptions, tipoOptions, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="ev-filter-bar">
      <div className="ev-filter-group">
        <Search size={16} className="ev-filter-icon" />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder={t('buscar_evento', 'Buscar evento...')}
          className="ev-filter-input"
        />
      </div>

      <div className="ev-filter-group">
        <Filter size={16} className="ev-filter-icon" />
        <select
          name="categoria"
          value={filters.categoria || ''}
          onChange={handleChange}
          className="ev-filter-select"
        >
          {categoriaOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ev-filter-group">
        <select
          name="tipo"
          value={filters.tipo || ''}
          onChange={handleChange}
          className="ev-filter-select"
        >
          {tipoOptions.map(opt => (
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
const EventosTable = ({ items, onDelete, deletingId, getImageUrl, t }) => {
  return (
    <div className="ev-table-wrapper">
      <table className="ev-table">
        <thead>
          <tr>
            <th>{t('image', 'Imagen')}</th>
            <th>{t('event_name', 'Evento')}</th>
            <th>{t('foundation', 'Fundación')}</th>
            <th>{t('type', 'Tipo')}</th>
            <th>{t('location', 'Ubicación')}</th>
            <th>{t('date', 'Fecha')}</th>
            <th>{t('attendees', 'Asistentes')}</th>
            <th>{t('likes', 'Likes')}</th>
            <th>{t('actions', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((evento) => (
            <tr key={evento.id}>
              <td>
                <div className="ev-imagen-cell">
                  {evento.imagen_url ? (
                    <img
                      src={getImageUrl(evento.imagen_url)}
                      alt={evento.nombre_evento}
                      className="ev-imagen"
                      onError={(e) => {
                        e.target.src = "/placeholder-event.png";
                      }}
                    />
                  ) : (
                    <div className="ev-imagen-placeholder">
                      <Image size={20} />
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="ev-evento-cell">
                  <span className="ev-evento-titulo">{evento.nombre_evento}</span>
                  <span className="ev-evento-desc">
                    {evento.descripcion?.substring(0, 50)}...
                  </span>
                </div>
              </td>
              <td>
                {evento.fundacion?.Nombre_1 ||
                  evento.fundacion?.nombre ||
                  "-"}
              </td>
              <td>
                <span className={`ev-tipo-badge ${evento.tipo === "admin" ? "ev-tipo-global" : "ev-tipo-fundacion"}`}>
                  {evento.tipo === "admin" ? (
                    <><Globe size={12} /> {t('global', 'Global')}</>
                  ) : (
                    <><Home size={12} /> {t('foundation', 'Fundación')}</>
                  )}
                </span>
              </td>
              <td>
                <div className="ev-location-cell">
                  <MapPin size={14} />
                  <span>{evento.lugar_evento}</span>
                </div>
              </td>
              <td>
                <div className="ev-date-cell">
                  <CalendarDays size={14} />
                  <span>
                    {new Date(evento.fecha_evento).toLocaleDateString()}
                  </span>
                </div>
              </td>
              <td>
                <span className="ev-asistentes-badge">
                  <Users size={12} />
                  {evento.total_asistentes || 0}
                </span>
              </td>
              <td>
                <span className="ev-likes-badge">
                  <Heart size={12} />
                  {evento.likes || 0}
                </span>
              </td>
              <td>
                <div className="ev-actions-cell">
                  <Link
                    to={`/admin/eventos/${evento.id}`}
                    className="ev-action-btn ev-btn-view"
                    title={t("view_details")}
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/admin/eventos/${evento.id}/editar`}
                    className="ev-action-btn ev-btn-edit"
                    title={t("edit")}
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => onDelete(evento.id)}
                    className="ev-action-btn ev-btn-delete"
                    disabled={deletingId === evento.id}
                    title={t("delete")}
                  >
                    {deletingId === evento.id ? (
                      <div className="ev-spinner-small"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
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
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="ev-pagination">
      <div className="ev-pagination-info">
        {t('mostrando', 'Mostrando')} {startItem} - {endItem} {t('de', 'de')} {totalItems}
      </div>
      <div className="ev-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ev-pagination-btn"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`ev-pagination-btn ${page === currentPage ? 'ev-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ev-pagination-btn"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default AdminEventosIndex;