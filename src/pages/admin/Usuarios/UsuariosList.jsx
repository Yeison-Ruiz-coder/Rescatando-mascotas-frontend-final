import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useAdminUsuarios } from "../../../hooks/useAdmin";
import "./UsuariosList.css";


const UsuariosList = () => {
  const { t } = useTranslation("admin");
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
    if (!displayUsuarios || displayUsuarios.length === 0) return t("sin_usuarios", "No se encontraron usuarios.");
    return t("mostrando_usuarios", {
      count: displayUsuarios.length,
      total: pagination.total || displayUsuarios.length,
    });
  }, [loading, displayUsuarios, pagination.total, t]);

  return (
    <div className="admin-usuarios-page">
      <div className="admin-usuarios-header">
        <div>
          <h1>{t("gestion_usuarios", "Gestión de Usuarios")}</h1>
          <p>{t("gestion_usuarios_desc", "Administra cuentas, estados y verificaciones.")}</p>
        </div>
        <div className="admin-usuarios-actions">
          <Link to="/admin/usuarios/pendientes" className="admin-usuarios-button secondary">
            {t("usuarios_pendientes", "Usuarios pendientes")}
          </Link>
          <Link to="/admin/usuarios/create" className="admin-usuarios-button primary">
            {t("crear_usuario", "Nuevo usuario")}
          </Link>
        </div>
      </div>

      <div className="admin-usuarios-filters">
        <div className="filter-item">
          <label>{t("buscar", "Buscar")}</label>
          <input
            type="search"
            value={filters.search}
            placeholder={t("buscar_placeholder", "Buscar por nombre, correo o tipo...")}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>
        <div className="filter-item">
          <label>{t("tipo", "Tipo")}</label>
          <select value={filters.tipo} onChange={(e) => handleFilterChange({ tipo: e.target.value })}>
            <option value="">{t("todos", "Todos")}</option>
            <option value="usuario">{t("usuario", "Usuario")}</option>
            <option value="fundacion">{t("fundacion", "Fundación")}</option>
            <option value="veterinaria">{t("veterinaria", "Veterinaria")}</option>
          </select>
        </div>
        <div className="filter-item">
          <label>{t("estado", "Estado")}</label>
          <select value={filters.estado} onChange={(e) => handleFilterChange({ estado: e.target.value })}>
            <option value="">{t("todos", "Todos")}</option>
            <option value="activo">{t("activo", "Activo")}</option>
            <option value="inactivo">{t("inactivo", "Inactivo")}</option>
            <option value="pendiente">{t("pendiente", "Pendiente")}</option>
          </select>
        </div>
      </div>

      <div className="admin-usuarios-summary">
        <span>{filteredMessage}</span>
      </div>

      {loading ? (
        <div className="admin-usuarios-loading">
          <LoadingSpinner text={t("cargando", "Cargando usuarios...")} />
        </div>
      ) : displayUsuarios && displayUsuarios.length > 0 ? (
        <div className="admin-usuarios-table-wrapper">
          <table className="admin-usuarios-table">
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
                    <td>{usuario.tipo || "-"}</td>
                    <td>
                      <span className={`badge estado ${usuario.estado || "desconocido"}`}>
                        {usuario.estado || "desconocido"}
                      </span>
                      {emailVerified ? (
                        <span className="badge verified">{t("email_verificado", "Email verificado")}</span>
                      ) : (
                        <span className="badge unverified">{t("email_no_verificado", "Email no verificado")}</span>
                      )}
                    </td>
                    <td>{getCreatedAt(usuario)}</td>
                    <td className="acciones-column">
                      <div className="acciones-group">
                        <Link to={`/admin/usuarios/${usuario.id}`} className="action-button info">
                          {t("ver", "Ver")}
                        </Link>
                        <Link to={`/admin/usuarios/${usuario.id}/editar`} className="action-button warning">
                          {t("editar", "Editar")}
                        </Link>
                        <button
                          className="action-button danger"
                          disabled={isProcessing(usuario.id)}
                          onClick={() => handleRemove(usuario)}
                        >
                          {isProcessing(usuario.id) ? t("procesando", "Procesando...") : t("eliminar", "Eliminar")}
                        </button>
                      </div>
                      <div className="acciones-group actions-secondary">
                        <button
                          className="action-button ghost"
                          disabled={isProcessing(usuario.id)}
                          onClick={() => handleToggleEstado(usuario)}
                        >
                          {usuario.estado === "activo" ? t("desactivar", "Desactivar") : t("activar", "Activar")}
                        </button>
                        {!emailVerified && (
                          <button
                            className="action-button ghost"
                            disabled={isProcessing(usuario.id)}
                            onClick={() => handleVerify(usuario)}
                          >
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
      ) : (
        <div className="admin-usuarios-empty">
          <p>{filteredMessage}</p>
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className="admin-usuarios-pagination">
          <button
            disabled={pagination.current_page === 1}
            onClick={() => handlePageChange(pagination.current_page - 1)}
          >
            {t("anterior", "Anterior")}
          </button>
          <span>
            {t("pagina", "Página")} {pagination.current_page} / {pagination.last_page}
          </span>
          <button
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => handlePageChange(pagination.current_page + 1)}
          >
            {t("siguiente", "Siguiente")}
          </button>
        </div>
      )}
    </div>
  );
};

export default UsuariosList;
