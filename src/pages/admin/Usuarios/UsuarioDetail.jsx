// src/pages/admin/Usuarios/UsuarioDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import adminService from "../../../services/adminService";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./UsuarioDetail.css";

const UsuarioDetail = () => {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const response = await adminService.getUsuario(id);
        setUsuario(response?.data || response || null);
      } catch (error) {
        toast.error(error.response?.data?.message || t("error_cargar_usuario", "Error al cargar el usuario"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUsuario();
    }
  }, [id, t]);

  const adminName = user?.name || user?.nombre || "Administrador";
  const adminAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="ud-container">
        <LoadingSpinner text={t("cargando_usuario", "Cargando usuario...")} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="ud-container">
        <div className="ud-empty">
          <i className="fas fa-user-slash"></i>
          <h2>{t("usuario_no_encontrado", "Usuario no encontrado")}</h2>
          <p>{t("usuario_no_encontrado_desc", "El usuario que buscas no existe o fue eliminado.")}</p>
          <button onClick={() => navigate("/admin/usuarios")} className="btn-primary">
            <i className="fas fa-arrow-left"></i> {t("volver", "Volver")}
          </button>
        </div>
      </div>
    );
  }

  const emailVerified = usuario.email_verified_at || usuario.email_verificado || usuario.email_verified;
  const createdAt = usuario.created_at || usuario.createdAt || usuario.fecha_creacion;

  return (
    <div className="ud-container">
      {/* ===== BANNER ===== */}
      <div className="ud-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t("detalle_usuario_titulo", { 
              defaultValue: "Detalles del usuario: {{nombre}}",
              nombre: usuario.nombre || usuario.nombre_entidad || usuario.email 
            }),
            solicitudes: 0,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="ud-content">
        <div className="bento-container">
          <div className="ud-header">
            <div>
              <h1>
                <i className="fas fa-user-circle" style={{ color: "var(--color-primary)", marginRight: "0.75rem" }}></i>
                {usuario.nombre || usuario.nombre_entidad || "Usuario"}
              </h1>
              <p>{t("detalle_usuario_desc", "Revisa la información principal y el estado de la cuenta.")}</p>
            </div>
            <div className="ud-actions">
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> {t("volver", "Volver")}
              </button>
              <button className="btn-primary" onClick={() => navigate(`/admin/usuarios/editar/${id}`)}>
                <i className="fas fa-edit"></i> {t("editar", "Editar")}
              </button>
            </div>
          </div>

          <div className="ud-grid">
            {/* Datos del usuario */}
            <div className="ud-section">
              <h2><i className="fas fa-user" style={{ color: "var(--color-primary)", marginRight: "0.5rem" }}></i> {t("datos_usuario", "Datos de usuario")}</h2>
              <div className="ud-row">
                <span>{t("nombre", "Nombre")}</span>
                <strong>{usuario.nombre || usuario.nombre_entidad || "-"}</strong>
              </div>
              <div className="ud-row">
                <span>{t("email", "Correo electrónico")}</span>
                <strong>{usuario.email || "-"}</strong>
              </div>
              <div className="ud-row">
                <span>{t("tipo_usuario", "Tipo")}</span>
                <strong>
                  <span className={`ud-badge tipo ${usuario.tipo || "usuario"}`}>
                    {usuario.tipo || "usuario"}
                  </span>
                </strong>
              </div>
              <div className="ud-row">
                <span>{t("estado_usuario", "Estado")}</span>
                <strong>
                  <span className={`ud-badge estado ${usuario.estado || "desconocido"}`}>
                    <i className={`fas fa-${usuario.estado === "activo" ? "check-circle" : usuario.estado === "pendiente" ? "clock" : "times-circle"}`}></i>
                    {usuario.estado || "desconocido"}
                  </span>
                </strong>
              </div>
              <div className="ud-row">
                <span>{t("email_verificado", "Email verificado")}</span>
                <strong>
                  <span className={`ud-badge ${emailVerified ? "verified" : "unverified"}`}>
                    <i className={`fas fa-${emailVerified ? "check" : "exclamation-triangle"}`}></i>
                    {emailVerified ? t("si", "Sí") : t("no", "No")}
                  </span>
                </strong>
              </div>
              <div className="ud-row">
                <span>{t("registro", "Registro")}</span>
                <strong>{createdAt ? new Date(createdAt).toLocaleString() : "-"}</strong>
              </div>
            </div>

            {/* Contacto */}
            <div className="ud-section">
              <h2><i className="fas fa-address-card" style={{ color: "var(--color-primary)", marginRight: "0.5rem" }}></i> {t("datos_contacto", "Contacto")}</h2>
              <div className="ud-row">
                <span>{t("telefono", "Teléfono")}</span>
                <strong>{usuario.telefono || "-"}</strong>
              </div>
              <div className="ud-row">
                <span>{t("direccion", "Dirección")}</span>
                <strong>{usuario.direccion || "-"}</strong>
              </div>
              {usuario.nombre_entidad && (
                <div className="ud-row">
                  <span>{t("nombre_entidad", "Nombre de la entidad")}</span>
                  <strong>{usuario.nombre_entidad}</strong>
                </div>
              )}
              {usuario.registro_sanitario && (
                <div className="ud-row">
                  <span>{t("registro_sanitario", "Registro sanitario")}</span>
                  <strong>{usuario.registro_sanitario}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioDetail;