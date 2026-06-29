// src/pages/admin/Usuarios/UsuariosList.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import FilterBar from "../../../components/common/FilterBar/FilterBar";
import { useAdminUsuarios } from "../../../hooks/useAdmin";
import "./UsuariosList.css";

const UsuariosList = () => {
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
  } = useAdminUsuarios();

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

  const displayUsuarios = usuarios;

  const filteredMessage = useMemo(() => {
    if (loading) return "";
    if (!displayUsuarios || displayUsuarios.length === 0) {
      return t("sin_usuarios", "No se encontraron usuarios.");
    }
    return t("mostrando_usuarios", {
      count: displayUsuarios.length,
      total: pagination.total || displayUsuarios.length,
    });
  }, [loading, displayUsuarios, pagination.total, t]);

  const hasActiveFilters = filters.search || filters.tipo || filters.estado;

  const adminName = user?.name || user?.nombre || "Administrador";
  const adminAvatar = user?.avatar || null;

  const totalUsuarios = pagination.total || usuarios.length;
  const activos = usuarios.filter(u => u.estado === 'activo').length;
  const pendientes = usuarios.filter(u => u.estado === 'pendiente').length;

  const filterBarFilters = {
    search: filters.search || '',
    tipo: filters.tipo || '',
    estado: filters.estado || '',
    sort: filters.sort || 'created_at_desc',
    total: totalUsuarios,
  };

  const handleFilterBarChange = (newFilters) => {
    handleFilterChange(newFilters);
  };

  return (
    <div className="ul-page">
      {/* ===== BANNER ===== */}
      <div className="ul-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t("admin_usuarios_titulo", "Administra todas las cuentas de usuarios del sistema"),
            solicitudes: totalUsuarios,
            adopciones: activos,
            eventos: pendientes,
          }}
        />
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="ul-filter-wrapper">
        <div className="bento-container">
          <FilterBar
            filters={filterBarFilters}
            onFilterChange={handleFilterBarChange}
            placeholder={t("buscar_placeholder", "Buscar por nombre, correo o tipo...")}
            showTypeFilter={true}
            showStatusFilter={true}
            showSort={true}
            isLoading={loading}
            typeOptions={[
              { value: '', label: t('todos_tipos', 'Todos los tipos') },
              { value: 'usuario', label: t('usuario', 'Usuarios') },
              { value: 'fundacion', label: t('fundacion', 'Fundaciones') },
              { value: 'veterinaria', label: t('veterinaria', 'Veterinarias') },
            ]}
            statusOptions={[
              { value: '', label: t('todos_estados', 'Todos los estados') },
              { value: 'activo', label: t('activo', 'Activo') },
              { value: 'inactivo', label: t('inactivo', 'Inactivo') },
              { value: 'pendiente', label: t('pendiente', 'Pendiente') },
            ]}
            sortOptions={[
              { value: 'created_at_desc', label: t('mas_recientes', 'Más recientes') },
              { value: 'created_at_asc', label: t('mas_antiguos', 'Más antiguos') },
              { value: 'nombre_asc', label: t('nombre_az', 'Nombre A-Z') },
              { value: 'nombre_desc', label: t('nombre_za', 'Nombre Z-A') },
            ]}
          />
        </div>
      </div>

      {/* ===== ACCIONES ===== */}
      <div className="ul-actions-wrapper">
        <div className="bento-container">
          <div className="ul-actions">
            <Link to="/admin/usuarios/pendientes" className="ul-button secondary">
              <i className="fas fa-clock"></i>
              {t("usuarios_pendientes", "Usuarios pendientes")}
            </Link>
            <Link to="/admin/usuarios/create" className="ul-button primary">
              <i className="fas fa-plus"></i>
              {t("crear_usuario", "Nuevo usuario")}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== TABLA ===== */}
      <div className="ul-table-wrapper">
        <div className="bento-container">
          <div className="ul-summary">
            <i className="fas fa-list"></i>
            <span>{filteredMessage}</span>
            {hasActiveFilters && (
              <button
                onClick={() => handleFilterChange({ search: '', tipo: '', estado: '', sort: 'created_at_desc' })}
                className="ul-clear-filters"
              >
                <i className="fas fa-times"></i> {t("limpiar_filtros", "Limpiar filtros")}
              </button>
            )}
          </div>

          {loading ? (
            <div className="ul-loading">
              <LoadingSpinner text={t("cargando", "Cargando usuarios...")} />
            </div>
          ) : displayUsuarios && displayUsuarios.length > 0 ? (
            <>
              <div className="ul-table-scroll">
                <table className="ul-table">
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
                    {displayUsuarios.map((usuario) => {
                      const emailVerified = usuario.email_verified_at || usuario.email_verificado || usuario.email_verified;
                      return (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.nombre || usuario.nombre_entidad || "-"}</td>
                          <td>{usuario.email || "-"}</td>
                          <td>
                            <span className={`ul-badge tipo ${usuario.tipo || "usuario"}`}>
                              {usuario.tipo || "usuario"}
                            </span>
                          </td>
                          <td>
                            <span className={`ul-badge estado ${usuario.estado || "desconocido"}`}>
                              <i className={`fas fa-${usuario.estado === "activo" ? "check-circle" : usuario.estado === "pendiente" ? "clock" : "times-circle"}`}></i>
                              {usuario.estado || "desconocido"}
                            </span>
                            <span className={`ul-badge ${emailVerified ? "verified" : "unverified"}`}>
                              <i className={`fas fa-${emailVerified ? "check" : "exclamation-triangle"}`}></i>
                              {emailVerified ? t("verificado", "Verificado") : t("no_verificado", "No verificado")}
                            </span>
                          </td>
                          <td>{getCreatedAt(usuario)}</td>
                          <td className="ul-acciones-column">
                            <div className="ul-acciones-group">
                              <Link to={`/admin/usuarios/${usuario.id}`} className="ul-action-button info">
                                <i className="fas fa-eye"></i> {t("ver", "Ver")}
                              </Link>
                              <Link to={`/admin/usuarios/editar/${usuario.id}`} className="ul-action-button warning">
                                <i className="fas fa-edit"></i> {t("editar", "Editar")}
                              </Link>
                              <button
                                className="ul-action-button danger"
                                disabled={isProcessing(usuario.id)}
                                onClick={() => handleRemove(usuario)}
                              >
                                <i className="fas fa-trash"></i>
                                {isProcessing(usuario.id) ? t("procesando", "Procesando...") : t("eliminar", "Eliminar")}
                              </button>
                            </div>
                            <div className="ul-acciones-group">
                              <button
                                className="ul-action-button ghost"
                                disabled={isProcessing(usuario.id)}
                                onClick={() => handleToggleEstado(usuario)}
                              >
                                <i className={`fas fa-${usuario.estado === "activo" ? "pause" : "play"}`}></i>
                                {usuario.estado === "activo" ? t("desactivar", "Desactivar") : t("activar", "Activar")}
                              </button>
                              {!emailVerified && (
                                <button
                                  className="ul-action-button ghost"
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
                <div className="ul-pagination">
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
            <div className="ul-empty">
              <i className={`fas fa-${hasActiveFilters ? "search" : "users"}`}></i>
              <h3>
                {hasActiveFilters 
                  ? t("sin_resultados", "No se encontraron resultados")
                  : t("sin_usuarios", "No hay usuarios registrados")
                }
              </h3>
              <p>
                {hasActiveFilters
                  ? t("sin_resultados_desc", "Prueba con otros criterios de búsqueda.")
                  : t("sin_usuarios_desc", "Comienza creando el primer usuario.")
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => handleFilterChange({ search: '', tipo: '', estado: '', sort: 'created_at_desc' })}
                  className="ul-clear-filters-btn"
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

export default UsuariosList;