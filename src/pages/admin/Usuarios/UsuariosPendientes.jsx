// src/pages/admin/Usuarios/UsuariosPendientes.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import adminService from "../../../services/adminService";
import UsuarioCard from "../../../components/common/UsuarioCard/UsuarioCard";
import FilterBar from "../../../components/common/FilterBar/FilterBar";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import { useAuth } from "../../../contexts/AuthContext";
import "./UsuariosPendientes.css";

const UsuariosPendientes = () => {
  const { t } = useTranslation("admin");
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    estado: '',
    sort: 'created_at_desc',
  });

  useEffect(() => {
    fetchPendientes();
  }, [currentPage, activeFilters.estado, activeFilters.sort, activeFilters.search]);

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const params = {
        estado: "pendiente",
        page: currentPage,
        per_page: 12,
        search: activeFilters.search || undefined,
      };

      const response = await adminService.getUsuarios(params);

      let usuariosData = [];
      let paginationData = {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      };

      if (response) {
        if (Array.isArray(response.data)) {
          usuariosData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          usuariosData = response.data.data;
          paginationData = {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            per_page: response.data.per_page || 12,
            total: response.data.total || 0
          };
        } else if (Array.isArray(response)) {
          usuariosData = response;
        } else if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            usuariosData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            usuariosData = response.data.data;
            paginationData = {
              current_page: response.data.current_page || 1,
              last_page: response.data.last_page || 1,
              per_page: response.data.per_page || 12,
              total: response.data.total || 0
            };
          }
        }
      }

      setUsuarios(usuariosData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("error_carga"));
      setUsuarios([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const aprobarUsuario = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await adminService.cambiarEstadoUsuario(id, { estado: "activo" });
      toast.success(t("aprobado_exito"));
      fetchPendientes();
    } catch (error) {
      toast.error(error.response?.data?.message || t("error_aprobar"));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const rechazarUsuario = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await adminService.cambiarEstadoUsuario(id, { estado: "inactivo" });
      toast.warning(t("rechazado_exito"));
      fetchPendientes();
    } catch (error) {
      toast.error(error.response?.data?.message || t("error_rechazar"));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.last_page, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const hasActiveFilters = () => {
    return activeFilters.search || activeFilters.estado;
  };

  const totalPendientes = pagination.total || usuarios.length;

  const adminName = user?.name || user?.nombre || "Administrador";
  const adminAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="up-container">
        <div className="up-loading">
          <div className="up-loading-spinner"></div>
          <p>{t("cargando")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="up-container">
      {/* ===== BANNER ===== */}
      <div className="up-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: "Revisa y aprueba las solicitudes de registro de nuevas cuentas",
            solicitudes: totalPendientes,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="up-filter-wrapper">
        <div className="bento-container">
          <FilterBar
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            placeholder="Buscar por nombre, correo o tipo..."
            showTypeFilter={false}
            isLoading={loading}
            statusOptions={[
              { value: '', label: 'Todos los estados' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'en_revision', label: 'En revisión' },
            ]}
            sortOptions={[
              { value: 'created_at_desc', label: 'Más recientes' },
              { value: 'created_at_asc', label: 'Más antiguos' },
              { value: 'nombre_asc', label: 'Nombre A-Z' },
              { value: 'nombre_desc', label: 'Nombre Z-A' },
            ]}
          />
        </div>
      </div>

      {/* ===== GRID DE TARJETAS ===== */}
      <div className="up-grid-wrapper">
        <div className="bento-container">
          {usuarios.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty-icon">
                {hasActiveFilters() ? (
                  <i className="fas fa-search"></i>
                ) : (
                  <i className="fas fa-check-circle"></i>
                )}
              </div>
              <h2>
                {hasActiveFilters() 
                  ? t("sin_resultados", "No se encontraron resultados")
                  : t("sin_solicitudes", "No hay solicitudes pendientes")
                }
              </h2>
              <p>
                {hasActiveFilters()
                  ? t("sin_resultados_desc", "No hay usuarios que coincidan con los filtros aplicados. Prueba con otros criterios de búsqueda.")
                  : t("sin_solicitudes_desc", "No hay solicitudes de registro pendientes de revisión.")
                }
              </p>
              {hasActiveFilters() && (
                <button 
                  onClick={() => {
                    setActiveFilters({
                      search: '',
                      estado: '',
                      sort: 'created_at_desc',
                    });
                    setCurrentPage(1);
                  }} 
                  className="up-btn-volver"
                >
                  <i className="fas fa-undo"></i> {t("limpiar_filtros", "Limpiar filtros")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="up-grid">
                {usuarios.map((usuario) => (
                  <UsuarioCard
                    key={usuario.id}
                    usuario={usuario}
                    onVer={() => console.log('Ver:', usuario.id)}
                    onEditar={() => console.log('Editar:', usuario.id)}
                    onActivar={() => aprobarUsuario(usuario.id)}
                    onEliminar={() => rechazarUsuario(usuario.id)}
                  />
                ))}
              </div>

              {/* Paginación */}
              {pagination.last_page > 1 && (
                <div className="up-pagination-wrapper">
                  <div className="up-pagination-info">
                    {t("mostrando")} {usuarios.length} {t("de")} {pagination.total} {t("solicitudes")}
                  </div>
                  <div className="up-pagination-controls">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={pagination.current_page === 1}
                      className="up-page-btn"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      onClick={() => goToPage(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="up-page-btn"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                    
                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`up-page-number ${pagination.current_page === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => goToPage(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="up-page-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() => goToPage(pagination.last_page)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="up-page-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosPendientes;