import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import adminService from "../../../services/adminService";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./UsuarioDetail.css";

const UsuarioDetail = () => {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) {
    return <LoadingSpinner text={t("cargando_usuario", "Cargando usuario...")} />;
  }

  if (!usuario) {
    return (
      <div className="usuario-detail-empty">
        <h2>{t("usuario_no_encontrado", "Usuario no encontrado")}</h2>
        <button onClick={() => navigate("/admin/usuarios")} className="btn-primary">
          {t("volver", "Volver")}
        </button>
      </div>
    );
  }

  const emailVerified = usuario.email_verified_at || usuario.email_verificado || usuario.email_verified;
  const createdAt = usuario.created_at || usuario.createdAt || usuario.fecha_creacion;

  return (
    <div className="usuario-detail-page">
      <div className="usuario-detail-card">
        <div className="usuario-detail-header">
          <div>
            <h1>{t("detalle_usuario", "Detalle de usuario")}</h1>
            <p>{t("detalle_usuario_desc", "Revisa la información principal y el estado de la cuenta.")}</p>
          </div>
          <div className="usuario-detail-actions">
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              {t("volver", "Volver")}
            </button>
            <button className="btn-primary" onClick={() => navigate(`/admin/usuarios/${id}/editar`)}>
              {t("editar", "Editar")}
            </button>
          </div>
        </div>

        <div className="usuario-detail-grid">
          <div className="usuario-detail-section">
            <h2>{t("datos_usuario", "Datos de usuario")}</h2>
            <div className="usuario-detail-row">
              <span>{t("nombre", "Nombre")}</span>
              <strong>{usuario.nombre || usuario.nombre_entidad || "-"}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("email", "Correo electrónico")}</span>
              <strong>{usuario.email || "-"}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("tipo_usuario", "Tipo")}</span>
              <strong>{usuario.tipo || "-"}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("estado_usuario", "Estado")}</span>
              <strong>{usuario.estado || "-"}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("email_verificado", "Email verificado")}</span>
              <strong>{emailVerified ? t("si", "Sí") : t("no", "No")}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("registro", "Registro")}</span>
              <strong>{createdAt ? new Date(createdAt).toLocaleString() : "-"}</strong>
            </div>
          </div>

          <div className="usuario-detail-section">
            <h2>{t("datos_contacto", "Contacto")}</h2>
            <div className="usuario-detail-row">
              <span>{t("telefono", "Teléfono")}</span>
              <strong>{usuario.telefono || "-"}</strong>
            </div>
            <div className="usuario-detail-row">
              <span>{t("direccion", "Dirección")}</span>
              <strong>{usuario.direccion || "-"}</strong>
            </div>
            {usuario.nombre_entidad && (
              <div className="usuario-detail-row">
                <span>{t("nombre_entidad", "Nombre de la entidad")}</span>
                <strong>{usuario.nombre_entidad}</strong>
              </div>
            )}
            {usuario.registro_sanitario && (
              <div className="usuario-detail-row">
                <span>{t("registro_sanitario", "Registro sanitario")}</span>
                <strong>{usuario.registro_sanitario}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioDetail;
