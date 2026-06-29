// src/pages/admin/catalogos/vacunas/VacunasIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import ProfileBanner from '../../../../components/common/ProfileBanner/ProfileBanner';
import '../razas/Razas.css';

const VacunasIndex = () => {
  const { t } = useTranslation(['admin', 'catalogos']);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vacunas, setVacunas] = useState([]);
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
  });
  const [selectedVacuna, setSelectedVacuna] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = pagination.total || 0;
    return { total };
  }, [pagination]);

  // ============================================
  // 🎯 CARGAR VACUNAS
  // ============================================
  const cargarVacunas = useCallback(async (page = 1, filtros = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        per_page: 15,
      };

      if (filtros.search) params.search = filtros.search;

      const response = await api.get('/admin/tipos-vacunas', { params });

      if (response.data.success) {
        const data = response.data.data.data;
        setVacunas(data.data || []);
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
  // ELIMINAR VACUNA
  // ============================================
  const handleEliminar = useCallback(async () => {
    if (!selectedVacuna) return;

    try {
      const response = await api.delete(`/admin/tipos-vacunas/${selectedVacuna.id}`);

      if (response.data.success) {
        toast.success(t('catalogos:vacuna_eliminada', { nombre: selectedVacuna.nombre_vacuna }));
        setShowDeleteModal(false);
        setSelectedVacuna(null);
        cargarVacunas(currentPage, filters);
      } else {
        toast.error(response.data.message || t('error_eliminar'));
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || t('error_eliminar'));
    }
  }, [selectedVacuna, cargarVacunas, currentPage, filters, t]);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    cargarVacunas(1, {});
  }, [cargarVacunas]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    cargarVacunas(1, filters);
  };

  const handleClearFilters = () => {
    setFilters({ search: '' });
    setCurrentPage(1);
    cargarVacunas(1, {});
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarVacunas(currentPage, filters);
  };

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    cargarVacunas(newPage, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditar = (id) => {
    navigate(`/admin/catalogos/vacunas/editar/${id}`);
  };

  const handleVerDetalle = (vacuna) => {
    setSelectedVacuna(vacuna);
    setShowDetailModal(true);
  };

  const handleConfirmarEliminar = (vacuna) => {
    setSelectedVacuna(vacuna);
    setShowDeleteModal(true);
  };

  const handleNuevo = () => {
    navigate('/admin/catalogos/vacunas/nueva');
  };

  const formatFrecuencia = (dias) => {
    if (!dias) return 'N/A';
    if (dias === 365) return 'Anual';
    if (dias === 180) return 'Semestral';
    if (dias === 90) return 'Trimestral';
    if (dias === 30) return 'Mensual';
    return `${dias} días`;
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading && vacunas.length === 0) {
    return (
      <div className="admin-catalogos-page-wrapper">
        <div className="admin-catalogos-loading-container">
          <div className="admin-catalogos-spinner"></div>
          <p>{t('catalogos:cargando_vacunas')}</p>
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
            titulo: t('catalogos:banner_vacunas_titulo', {
              defaultValue: 'Catálogo de Vacunas · {{count}} registradas',
              count: stats.total,
            }),
            solicitudes: stats.total,
            adopciones: 0,
            eventos: 0,
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
                <i className="fas fa-syringe"></i> {t('catalogos:vacunas')}
              </h2>
              <span className="admin-catalogos-badge-count">{stats.total}</span>
            </div>
            <div className="admin-catalogos-header-right">
              <button onClick={handleRefresh} className="admin-catalogos-btn-refresh" disabled={refreshing}>
                <i className={`fas fa-sync-alt ${refreshing ? 'admin-catalogos-spin' : ''}`}></i>
              </button>
              <button onClick={handleNuevo} className="admin-catalogos-btn-primary">
                <i className="fas fa-plus"></i>
                {t('catalogos:nueva_vacuna')}
              </button>
            </div>
          </div>

          {/* FILTROS */}
          <div className="admin-catalogos-filters">
            <div className="admin-catalogos-filter-group">
              <i className="fas fa-search admin-catalogos-filter-icon"></i>
              <input
                type="text"
                name="search"
                placeholder={t('catalogos:buscar_vacuna')}
                value={filters.search}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="admin-catalogos-filter-input"
              />
            </div>

            <button onClick={handleApplyFilters} className="admin-catalogos-btn-filter">
              <i className="fas fa-filter"></i> {t('catalogos:filtrar')}
            </button>
            <button onClick={handleClearFilters} className="admin-catalogos-btn-clear">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* TABLA */}
          <div className="admin-catalogos-table-wrapper">
            <table className="admin-catalogos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('catalogos:nombre_vacuna')}</th>
                  <th>{t('catalogos:frecuencia')}</th>
                  <th>{t('catalogos:mascotas_asociadas')}</th>
                  <th>{t('catalogos:fecha_creacion')}</th>
                  <th className="admin-catalogos-text-center">{t('catalogos:acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {vacunas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-catalogos-empty-row">
                      <i className="fas fa-syringe"></i>
                      <p>{t('catalogos:sin_vacunas')}</p>
                    </td>
                  </tr>
                ) : (
                  vacunas.map((vacuna, index) => (
                    <tr key={vacuna.id}>
                      <td>{(currentPage - 1) * 15 + index + 1}</td>
                      <td>
                        <span className="admin-catalogos-nombre">{vacuna.nombre_vacuna}</span>
                      </td>
                      <td>
                        <span className="admin-catalogos-vacuna-frecuencia">
                          {formatFrecuencia(vacuna.frecuencia_dias)}
                        </span>
                      </td>
                      <td>
                        <span className="admin-catalogos-mascotas-count">
                          {vacuna.mascotas?.length || 0}
                        </span>
                      </td>
                      <td>{new Date(vacuna.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-catalogos-table-actions">
                          <button
                            onClick={() => handleVerDetalle(vacuna)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-view"
                            title={t('catalogos:ver_detalle')}
                          >
                            <i className="fas fa-eye"></i>
                            <span>{t('catalogos:ver')}</span>
                          </button>
                          <button
                            onClick={() => handleEditar(vacuna.id)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-edit"
                            title={t('catalogos:editar')}
                          >
                            <i className="fas fa-edit"></i>
                            <span>{t('catalogos:editar')}</span>
                          </button>
                          <button
                            onClick={() => handleConfirmarEliminar(vacuna)}
                            className="admin-catalogos-btn-action admin-catalogos-btn-delete"
                            title={t('catalogos:eliminar')}
                            disabled={vacuna.mascotas?.length > 0}
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

      {/* ===== MODALES ===== */}
      {showDetailModal && selectedVacuna && (
        <div className="admin-catalogos-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-catalogos-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-catalogos-modal-header">
              <h3>{selectedVacuna.nombre_vacuna}</h3>
              <button className="admin-catalogos-modal-close" onClick={() => setShowDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-catalogos-modal-body">
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:nombre_vacuna')}</span>
                <span className="admin-catalogos-detail-value">{selectedVacuna.nombre_vacuna}</span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:frecuencia')}</span>
                <span className="admin-catalogos-detail-value">
                  {formatFrecuencia(selectedVacuna.frecuencia_dias)}
                </span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:mascotas_asociadas')}</span>
                <span className="admin-catalogos-detail-value">{selectedVacuna.mascotas?.length || 0}</span>
              </div>
              <div className="admin-catalogos-detail-row">
                <span className="admin-catalogos-detail-label">{t('catalogos:fecha_creacion')}</span>
                <span className="admin-catalogos-detail-value">
                  {new Date(selectedVacuna.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="admin-catalogos-modal-footer">
              <button
                onClick={() => handleEditar(selectedVacuna.id)}
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
      {showDeleteModal && selectedVacuna && (
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
                {t('catalogos:confirmar_eliminar_mensaje_vacuna', {
                  nombre: selectedVacuna.nombre_vacuna,
                })}
              </p>
              {selectedVacuna.mascotas?.length > 0 && (
                <div className="admin-catalogos-warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  {t('catalogos:vacuna_tiene_mascotas', {
                    count: selectedVacuna.mascotas.length,
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
                disabled={selectedVacuna.mascotas?.length > 0}
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

export default VacunasIndex;