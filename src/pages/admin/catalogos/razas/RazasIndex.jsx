// src/pages/admin/catalogos/razas/RazasIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import ProfileBanner from '../../../../components/common/ProfileBanner/ProfileBanner';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';
import './Razas.css';

const RazasIndex = () => {
  const { t } = useTranslation(['admin', 'catalogos']);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [razas, setRazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    especie: 'todos',
  });
  const [selectedRaza, setSelectedRaza] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = pagination.total || 0;
    const perros = razas.filter(r => r.especie === 'Perro').length;
    const gatos = razas.filter(r => r.especie === 'Gato').length;
    const otros = razas.filter(r => r.especie && r.especie !== 'Perro' && r.especie !== 'Gato').length;
    return { total, perros, gatos, otros };
  }, [razas, pagination]);

  // ===== ESPECIES DISPONIBLES =====
  const especiesDisponibles = useMemo(() => {
    const especies = new Set();
    razas.forEach(r => {
      if (r.especie) especies.add(r.especie);
    });
    const lista = ['todos', ...Array.from(especies)];
    return lista.map(e => ({
      value: e,
      label: e === 'todos' ? t('catalogos:todas_especies') : e
    }));
  }, [razas, t]);

  // ============================================
  // 🎯 CARGAR RAZAS
  // ============================================
  const cargarRazas = useCallback(async (page = 1, filtros = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        per_page: 15,
      };

      if (filtros.search) params.search = filtros.search;
      if (filtros.especie && filtros.especie !== 'todos') params.especie = filtros.especie;

      const response = await api.get('/admin/razas', { params });

      if (response.data.success) {
        const data = response.data.data.data;
        setRazas(data.data || []);
        setPagination({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          total: data.total || 0,
        });
        setCurrentPage(page);
      } else {
        setError(response.data.message || t('error_carga'));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || t('error_carga'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // ============================================
  // ELIMINAR RAZA
  // ============================================
  const handleEliminar = useCallback(async () => {
    if (!selectedRaza) return;

    try {
      const response = await api.delete(`/admin/razas/${selectedRaza.id}`);

      if (response.data.success) {
        toast.success(t('catalogos:raza_eliminada', { nombre: selectedRaza.nombre_raza }));
        setShowDeleteModal(false);
        setSelectedRaza(null);
        cargarRazas(currentPage, filters);
      } else {
        toast.error(response.data.message || t('error_eliminar'));
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || t('error_eliminar'));
    }
  }, [selectedRaza, cargarRazas, currentPage, filters, t]);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    cargarRazas(1, {});
  }, [cargarRazas]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    cargarRazas(1, filters);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', especie: 'todos' });
    setCurrentPage(1);
    cargarRazas(1, {});
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarRazas(currentPage, filters);
  };

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    cargarRazas(newPage, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditar = (id) => {
    navigate(`/admin/catalogos/razas/editar/${id}`);
  };

  const handleVerDetalle = (raza) => {
    setSelectedRaza(raza);
    setShowDetailModal(true);
  };

  const handleConfirmarEliminar = (raza) => {
    setSelectedRaza(raza);
    setShowDeleteModal(true);
  };

  const handleNuevo = () => {
    navigate('/admin/catalogos/razas/nueva');
  };

  const getEspecieBadge = (especie) => {
    const configs = {
      Perro: { class: 'admin-catalogos-badge-perro', icon: 'fa-dog' },
      Gato: { class: 'admin-catalogos-badge-gato', icon: 'fa-cat' },
    };
    const config = configs[especie];
    if (config) {
      return (
        <span className={`admin-catalogos-badge ${config.class}`}>
          <i className={`fas ${config.icon}`}></i> {especie}
        </span>
      );
    }
    return (
      <span className="admin-catalogos-badge admin-catalogos-badge-otro">
        <i className="fas fa-paw"></i> {especie || t('catalogos:sin_especie')}
      </span>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading && razas.length === 0) {
    return (
      <div className="admin-catalogos-page-wrapper">
        <div className="admin-catalogos-loading-container">
          <div className="admin-catalogos-spinner"></div>
          <p>{t('catalogos:cargando_razas')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-catalogos-page-wrapper">
      {/* ===== BANNER ===== */}
      <div className="admin-catalogos-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('catalogos:banner_razas_titulo', {
              defaultValue: 'Catálogo de Razas · {{count}} registradas',
              count: stats.total,
            }),
            solicitudes: stats.total,
            adopciones: stats.perros,
            eventos: stats.gatos,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="admin-catalogos-content-wrapper">
        <div className="admin-catalogos-bento-container">
          {/* HEADER */}
          <div className="admin-catalogos-header">
            <div className="admin-catalogos-header-left">
              <h2>
                <i className="fas fa-dog"></i> {t('catalogos:razas')}
              </h2>
              <span className="admin-catalogos-badge-count">{stats.total}</span>
            </div>
            <div className="admin-catalogos-header-right">
              <button onClick={handleRefresh} className="admin-catalogos-btn-refresh" disabled={refreshing}>
                <i className={`fas fa-sync-alt ${refreshing ? 'admin-catalogos-spin' : ''}`}></i>
              </button>
              <button onClick={handleNuevo} className="admin-catalogos-btn-primary">
                <i className="fas fa-plus"></i>
                {t('catalogos:nueva_raza')}
              </button>
            </div>
          </div>

          {/* FILTROS CON CUSTOM SELECT */}
          <div className="admin-catalogos-filters">
            <div className="admin-catalogos-filter-group">
              <i className="fas fa-search admin-catalogos-filter-icon"></i>
              <input
                type="text"
                name="search"
                placeholder={t('catalogos:buscar_raza')}
                value={filters.search}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="admin-catalogos-filter-input"
              />
            </div>

            <div className="admin-catalogos-filter-group">
              <i className="fas fa-filter admin-catalogos-filter-icon"></i>
              <CustomSelect
                options={especiesDisponibles}
                value={filters.especie}
                onChange={(e) => handleCustomSelectChange('especie', e.target.value)}
                name="especie"
                placeholder={t('catalogos:seleccionar_especie')}
              />
            </div>

            <button onClick={handleApplyFilters} className="admin-catalogos-btn-filter">
              <i className="fas fa-filter"></i> {t('catalogos:filtrar')}
            </button>
            <button onClick={handleClearFilters} className="admin-catalogos-btn-clear">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* STATS */}
          <div className="admin-catalogos-stats">
            <div className="admin-catalogos-stat-item">
              <span className="admin-catalogos-stat-label">{t('catalogos:total')}</span>
              <span className="admin-catalogos-stat-value">{stats.total}</span>
            </div>
            <div className="admin-catalogos-stat-item">
              <span className="admin-catalogos-stat-label"><i className="fas fa-dog"></i> {t('catalogos:perros')}</span>
              <span className="admin-catalogos-stat-value">{stats.perros}</span>
            </div>
            <div className="admin-catalogos-stat-item">
              <span className="admin-catalogos-stat-label"><i className="fas fa-cat"></i> {t('catalogos:gatos')}</span>
              <span className="admin-catalogos-stat-value">{stats.gatos}</span>
            </div>
            <div className="admin-catalogos-stat-item">
              <span className="admin-catalogos-stat-label"><i className="fas fa-paw"></i> {t('catalogos:otros')}</span>
              <span className="admin-catalogos-stat-value">{stats.otros}</span>
            </div>
          </div>

          {/* TABLA */}
          <div className="admin-catalogos-table-wrapper">
            <table className="admin-catalogos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('catalogos:nombre_raza')}</th>
                  <th>{t('catalogos:especie')}</th>
                  <th>{t('catalogos:mascotas_asociadas')}</th>
                  <th>{t('catalogos:fecha_creacion')}</th>
                  <th className="admin-catalogos-text-center">{t('catalogos:acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {razas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-catalogos-empty-row">
                      <i className="fas fa-dog"></i>
                      <p>{t('catalogos:sin_razas')}</p>
                    </td>
                  </tr>
                ) : (
                  razas.map((raza, index) => (
                    <tr key={raza.id}>
                      <td>{(currentPage - 1) * 15 + index + 1}</td>
                      <td>
                        <span className="admin-catalogos-nombre">{raza.nombre_raza}</span>
                      </td>
                      <td>{getEspecieBadge(raza.especie)}</td>
                      <td>
                        <span className="admin-catalogos-mascotas-count">
                          {raza.mascotas?.length || 0}
                        </span>
                      </td>
                      <td>{new Date(raza.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-catalogos-table-actions">
                          <button
                            onClick={() => handleVerDetalle(raza)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-view"
                            title={t('catalogos:ver_detalle')}
                          >
                            <i className="fas fa-eye"></i>
                            <span>{t('catalogos:ver')}</span>
                          </button>
                          <button
                            onClick={() => handleEditar(raza.id)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-edit"
                            title={t('catalogos:editar')}
                          >
                            <i className="fas fa-edit"></i>
                            <span>{t('catalogos:editar')}</span>
                          </button>
                          <button
                            onClick={() => handleConfirmarEliminar(raza)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-delete"
                            title={t('catalogos:eliminar')}
                            disabled={raza.mascotas?.length > 0}
                          >
                            <i className="fas fa-trash"></i>
                            <span>{t('catalogos:eliminar')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {pagination.last_page > 1 && (
            <div className="admin-catalogos-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="admin-catalogos-pagination-btn"
              >
                <i className="fas fa-chevron-left"></i> {t('catalogos:anterior')}
              </button>
              <span className="admin-catalogos-pagination-info">
                {t('catalogos:pagina')} {currentPage} {t('catalogos:de')} {pagination.last_page}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="admin-catalogos-pagination-btn"
              >
                {t('catalogos:siguiente')} <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL DETALLE ===== */}
      {showDetailModal && selectedRaza && (
        <div className="admin-catalogos-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-catalogos-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-catalogos-modal-header">
              <h3>{selectedRaza.nombre_raza}</h3>
              <button className="admin-catalogos-modal-close" onClick={() => setShowDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-catalogos-modal-body">
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:nombre_raza')}</span>
                <span className="admin-catalogos-detail-value">{selectedRaza.nombre_raza}</span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:especie')}</span>
                <span className="admin-catalogos-detail-value">{getEspecieBadge(selectedRaza.especie)}</span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:mascotas_asociadas')}</span>
                <span className="admin-catalogos-detail-value">{selectedRaza.mascotas?.length || 0}</span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:fecha_creacion')}</span>
                <span className="admin-catalogos-detail-value">
                  {new Date(selectedRaza.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="admin-catalogos-modal-footer">
              <button
                onClick={() => handleEditar(selectedRaza.id)}
                className="admin-catalogos-modal-btn-edit"
              >
                <i className="fas fa-edit"></i> {t('catalogos:editar')}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="admin-catalogos-modal-btn-close"
              >
                {t('catalogos:cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ELIMINAR ===== */}
      {showDeleteModal && selectedRaza && (
        <div className="admin-catalogos-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-catalogos-modal-content admin-catalogos-modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="admin-catalogos-modal-header">
              <h3>{t('catalogos:confirmar_eliminar')}</h3>
              <button className="admin-catalogos-modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-catalogos-modal-body">
              <p>
                {t('catalogos:confirmar_eliminar_mensaje', {
                  nombre: selectedRaza.nombre_raza,
                })}
              </p>
              {selectedRaza.mascotas?.length > 0 && (
                <div className="admin-catalogos-warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  {t('catalogos:raza_tiene_mascotas', {
                    count: selectedRaza.mascotas.length,
                  })}
                </div>
              )}
            </div>
            <div className="admin-catalogos-modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="admin-catalogos-modal-btn-cancel"
              >
                {t('catalogos:cancelar')}
              </button>
              <button
                onClick={handleEliminar}
                className="admin-catalogos-modal-btn-delete"
                disabled={selectedRaza.mascotas?.length > 0}
              >
                <i className="fas fa-trash"></i> {t('catalogos:eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RazasIndex;