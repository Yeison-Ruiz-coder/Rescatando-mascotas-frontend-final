// src/pages/admin/Usuarios/UsuariosTipoList.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import FilterBar from "../../../components/common/FilterBar/FilterBar";
import { useAdminUsuarios } from "../../../hooks/useAdmin";
import "./UsuariosTipoList.css";

const UsuariosTipoList = ({ tipo, titulo, descripcion }) => {
  const { t } = useTranslation("admin");
  const { user } = useAuth();
  const {
    usuarios,
    loading,
    pagination,
    filters,
    handleFilterChange,
    handlePageChange,
    handleDelete,
    handleChangeEstado,
    handleVerifyEmail,
  } = useAdminUsuarios({ tipo });

  const [processingIds, setProcessingIds] = useState({});

  const isProcessing = (id) => !!processingIds[id];

  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: true }));
    await handleChangeEstado(usuario.id, { estado: nuevoEstado });
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: false }));
  };

  const handleVerify = async (usuario) => {
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: true }));
    await handleVerifyEmail(usuario.id);
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: false }));
  };

  const handleRemove = async (usuario) => {
    const confirmText = t("confirm_delete_usuario", "¿Eliminar usuario?");
    if (!window.confirm(confirmText)) return;
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: true }));
    await handleDelete(usuario.id, usuario.nombre || usuario.nombre_entidad || usuario.email);
    setProcessingIds((prev) => ({ ...prev, [usuario.id]: false }));
  };

  const getCreatedAt = (usuario) => {
    const fecha = usuario.created_at || usuario.createdAt || usuario.fecha_creacion || usuario.fecha_registro;
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString();
  };

  const filteredMessage = useMemo(() => {
    if (loading) return "";
    if (!usuarios || usuarios.length === 0) {
      const hasFilters = filters.search || filters.estado;
      return hasFilters 
        ? t("sin_resultados", "No se encontraron resultados")
        : t("sin_usuarios", "No se encontraron usuarios.");
    }
    return t("mostrando_usuarios", {
      count: usuarios.length,
      total: pagination.total || usuarios.length,
    });
  }, [loading, usuarios, pagination.total, filters, t]);

  const adminName = user?.name || user?.nombre || "Administrador";
  const adminAvatar = user?.avatar || null;
  const totalUsuarios = pagination.total || usuarios.length;

  const filterBarFilters = {
    search: filters.search || '',
    estado: filters.estado || '',
    sort: filters.sort || 'created_at_desc',
    total: totalUsuarios,
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  const showTypeFilter = false;

  return (
    <div className="utl-page">
      {/* ===== BANNER ===== */}
      <div className="utl-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: descripcion || `Gestión de ${titulo}`,
            solicitudes: totalUsuarios,
            adopciones: usuarios?.filter(u => u.estado === 'activo').length || 0,
            eventos: usuarios?.filter(u => u.estado === 'pendiente').length || 0,
          }}
        />
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="utl-filter-wrapper">
        <div className="bento-container">
          <FilterBar
            filters={filterBarFilters}
            onFilterChange={handleFilterChange}
            placeholder={t("buscar_placeholder", "Buscar por nombre o correo...")}
            showTypeFilter={showTypeFilter}
            showStatusFilter={true}
            showSort={true}
            isLoading={loading}
            statusOptions={statusOptions}
            sortOptions={[
              { value: 'created_at_desc', label: 'Más recientes' },
              { value: 'created_at_asc', label: 'Más antiguos' },
              { value: 'nombre_asc', label: 'Nombre A-Z' },
              { value: 'nombre_desc', label: 'Nombre Z-A' },
            ]}
          />
        </div>
      </div>

      {/* ===== ACCIONES ===== */}
      <div className="utl-actions-wrapper">
        <div className="bento-container">
          <div className="utl-actions">
            <Link to="/admin/usuarios/pendientes" className="utl-button secondary">
              <i className="fas fa-clock"></i>
              {t("usuarios_pendientes", "Usuarios pendientes")}
            </Link>
            <Link to="/admin/usuarios/create" className="utl-button primary">
              <i className="fas fa-plus"></i>
              {t("crear_usuario", "Nuevo usuario")}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== TABLA ===== */}
      <div className="utl-table-wrapper">
        <div className="bento-container">
          <div className="utl-summary">
            <i className="fas fa-list"></i>
            <span>{filteredMessage}</span>
            {(filters.search || filters.estado) && (
              <button
                onClick={() => handleFilterChange({ search: '', estado: '', sort: 'created_at_desc' })}
                className="utl-clear-filters"
              >
                <i className="fas fa-times"></i> {t("limpiar_filtros", "Limpiar filtros")}
              </button>
            )}
          </div>

          {loading ? (
            <div className="utl-loading">
              <LoadingSpinner text={t("cargando", "Cargando usuarios...")} />
            </div>
          ) : usuarios && usuarios.length > 0 ? (
            <>
              <div className="utl-table-scroll">
                <table className="utl-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t("nombre", "Nombre")}</th>
                      <th>{t("correo", "Correo")}</th>
                      <th>{t("tipo", "Tipo")}</th>
                      <th>{t("estado", "Estado")}</th>
                      <th>{t("registro", "Registro")}</th>
                      <th>{t("acciones", "Acciones")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => {
                      const emailVerified = usuario.email_verified_at || usuario.email_verificado || usuario.email_verified;
                      return (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.nombre || usuario.nombre_entidad || "-"}</td>
                          <td>{usuario.email || "-"}</td>
                          <td>
                            <span className={`utl-badge tipo ${usuario.tipo || "usuario"}`}>
                              {usuario.tipo || "usuario"}
                            </span>
                          </td>
                          <td>
                            <span className={`utl-badge estado ${usuario.estado || "desconocido"}`}>
                              <i className={`fas fa-${usuario.estado === "activo" ? "check-circle" : usuario.estado === "pendiente" ? "clock" : "times-circle"}`}></i>
                              {usuario.estado || "desconocido"}
                            </span>
                            <span className={`utl-badge ${emailVerified ? "verified" : "unverified"}`}>
                              <i className={`fas fa-${emailVerified ? "check" : "exclamation-triangle"}`}></i>
                              {emailVerified ? t("verificado", "Verificado") : t("no_verificado", "No verificado")}
                            </span>
                          </td>
                          <td>{getCreatedAt(usuario)}</td>
                          <td className="utl-acciones-column">
                            <div className="utl-acciones-group">
                              <Link to={`/admin/usuarios/${usuario.id}`} className="utl-action-button info">
                                <i className="fas fa-eye"></i> {t("ver", "Ver")}
                              </Link>
                              <Link to={`/admin/usuarios/${usuario.id}/editar`} className="utl-action-button warning">
                                <i className="fas fa-edit"></i> {t("editar", "Editar")}
                              </Link>
                              <button
                                className="utl-action-button danger"
                                disabled={isProcessing(usuario.id)}
                                onClick={() => handleRemove(usuario)}
                              >
                                <i className="fas fa-trash"></i>
                                {isProcessing(usuario.id) ? t("procesando", "Procesando...") : t("eliminar", "Eliminar")}
                              </button>
                            </div>
                            <div className="utl-acciones-group">
                              <button
                                className="utl-action-button ghost"
                                disabled={isProcessing(usuario.id)}
                                onClick={() => handleToggleEstado(usuario)}
                              >
                                <i className={`fas fa-${usuario.estado === "activo" ? "pause" : "play"}`}></i>
                                {usuario.estado === "activo" ? t("desactivar", "Desactivar") : t("activar", "Activar")}
                              </button>
                              {!emailVerified && (
                                <button
                                  className="utl-action-button ghost"
                                  disabled={isProcessing(usuario.id)}
                                  onClick={() => handleVerify(usuario)}
                                >
                                  <i className="fas fa-envelope"></i>
                                  {t("verificar_email", "Verificar email")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pagination.last_page > 1 && (
                <div className="utl-pagination">
                  <button
                    disabled={pagination.current_page === 1}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                  >
                    <i className="fas fa-chevron-left"></i> {t("anterior", "Anterior")}
                  </button>
                  <span>
                    {t("pagina", "Página")} {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                  >
                    {t("siguiente", "Siguiente")} <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="utl-empty">
              <i className={`fas fa-${(filters.search || filters.estado) ? "search" : "users"}`}></i>
              <h3>
                {(filters.search || filters.estado) 
                  ? t("sin_resultados", "No se encontraron resultados")
                  : t("sin_usuarios", "No hay usuarios registrados")
                }
              </h3>
              <p>
                {(filters.search || filters.estado)
                  ? t("sin_resultados_desc", "Prueba con otros criterios de búsqueda.")
                  : t("sin_usuarios_desc", "Comienza creando el primer usuario.")
                }
              </p>
              {(filters.search || filters.estado) && (
                <button
                  onClick={() => handleFilterChange({ search: '', estado: '', sort: 'created_at_desc' })}
                  className="utl-clear-filters-btn"
                >
                  <i className="fas fa-undo"></i> {t("limpiar_filtros", "Limpiar filtros")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosTipoList;