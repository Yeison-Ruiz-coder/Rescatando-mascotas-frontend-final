// src/pages/admin/Usuarios/UsuarioForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import adminService from "../../../services/adminService";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./UsuarioForm.css";

const UsuarioForm = () => {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    tipo: "usuario",
    estado: "activo",
    nombre_entidad: "",
    telefono: "",
    direccion: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!isEditing) return;
    const loadUsuario = async () => {
      setLoading(true);
      try {
        const response = await adminService.getUsuario(id);
        const usuario = response?.data || response || {};
        setFormData((prev) => ({
          ...prev,
          nombre: usuario.nombre || usuario.nombre_entidad || "",
          email: usuario.email || "",
          tipo: usuario.tipo || "usuario",
          estado: usuario.estado || "activo",
          nombre_entidad: usuario.nombre_entidad || "",
          telefono: usuario.telefono || "",
          direccion: usuario.direccion || "",
        }));
      } catch (error) {
        toast.error(error.response?.data?.message || t("error_cargar_usuario", "Error al cargar el usuario"));
      } finally {
        setLoading(false);
      }
    };

    loadUsuario();
  }, [id, isEditing, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        tipo: formData.tipo,
        estado: formData.estado,
        nombre_entidad: formData.nombre_entidad,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ...(formData.password ? { password: formData.password } : {}),
        ...(formData.password_confirmation ? { password_confirmation: formData.password_confirmation } : {}),
      };

      if (isEditing) {
        await adminService.updateUsuario(id, payload);
        toast.success(t("actualizar_exito", "Usuario actualizado correctamente"));
      } else {
        await adminService.createUsuario(payload);
        toast.success(t("crear_exito", "Usuario creado correctamente"));
      }

      navigate("/admin/usuarios");
    } catch (error) {
      toast.error(error.response?.data?.message || t("error_guardar_usuario", "Error al guardar el usuario"));
    } finally {
      setSaving(false);
    }
  };

  const showEntityFields = formData.tipo === "fundacion" || formData.tipo === "veterinaria";

  const adminName = user?.name || user?.nombre || "Administrador";
  const adminAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="uf-container">
        <LoadingSpinner text={t("cargando_usuario", "Cargando usuario...")} />
      </div>
    );
  }

  return (
    <div className="uf-container">
      {/* ===== BANNER ===== */}
      <div className="uf-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: isEditing ? t("editando_usuario", "Editando usuario") : t("creando_usuario", "Creando nuevo usuario"),
            solicitudes: 0,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== FORMULARIO ===== */}
      <div className="uf-content">
        <div className="bento-container">
          <div className="uf-card">
            <div className="uf-header">
              <div>
                <h1>
                  <i className="fas fa-user-plus" style={{ color: "var(--color-primary)", marginRight: "0.75rem" }}></i>
                  {isEditing ? t("editar_usuario", "Editar usuario") : t("nuevo_usuario", "Nuevo usuario")}
                </h1>
                <p>{t("usuario_form_desc", "Completa los datos para administrar la cuenta.")}</p>
              </div>
            </div>

            <form className="uf-form" onSubmit={handleSubmit}>
              <div className="uf-grid">
                <div className="uf-field">
                  <label>{t("nombre", "Nombre")} <span className="required">*</span></label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder={t("nombre_placeholder", "Nombre completo")}
                    required
                  />
                </div>

                <div className="uf-field">
                  <label>{t("email", "Correo electrónico")} <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("email_placeholder", "correo@ejemplo.com")}
                    required
                  />
                </div>

                <div className="uf-field">
                  <label>{t("tipo_usuario", "Tipo")} <span className="required">*</span></label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                    <option value="usuario">{t("usuario", "Usuario")}</option>
                    <option value="fundacion">{t("fundacion", "Fundación")}</option>
                    <option value="veterinaria">{t("veterinaria", "Veterinaria")}</option>
                  </select>
                </div>

                <div className="uf-field">
                  <label>{t("estado_usuario", "Estado")} <span className="required">*</span></label>
                  <select name="estado" value={formData.estado} onChange={handleChange} required>
                    <option value="activo">{t("activo", "Activo")}</option>
                    <option value="inactivo">{t("inactivo", "Inactivo")}</option>
                    <option value="pendiente">{t("pendiente", "Pendiente")}</option>
                  </select>
                </div>

                {showEntityFields && (
                  <>
                    <div className="uf-field uf-full">
                      <label>{t("nombre_entidad", "Nombre de la entidad")}</label>
                      <input
                        type="text"
                        name="nombre_entidad"
                        value={formData.nombre_entidad}
                        onChange={handleChange}
                        placeholder={t("nombre_entidad_placeholder", "Nombre de la fundación o clínica")}
                      />
                    </div>
                    <div className="uf-field">
                      <label>{t("telefono", "Teléfono")}</label>
                      <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder={t("telefono_placeholder", "+57 300 000 0000")}
                      />
                    </div>
                    <div className="uf-field uf-full">
                      <label>{t("direccion", "Dirección")}</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder={t("direccion_placeholder", "Ciudad, barrio o dirección")}
                      />
                    </div>
                  </>
                )}

                <div className="uf-field">
                  <label>{t("contraseña", "Contraseña")}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEditing ? t("contraseña_placeholder_editar", "Dejar vacío para no cambiar") : t("contraseña_placeholder", "Mínimo 8 caracteres")}
                    autoComplete="new-password"
                  />
                </div>

                <div className="uf-field">
                  <label>{t("confirmar_contraseña", "Confirmar contraseña")}</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder={t("confirmar_contraseña_placeholder", "Repite la contraseña")}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="uf-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                  <i className="fas fa-times"></i> {t("cancelar", "Cancelar")}
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (
                    <><i className="fas fa-spinner fa-spin"></i> {t("guardando", "Guardando...")}</>
                  ) : (
                    <><i className="fas fa-save"></i> {t("guardar", "Guardar")}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioForm;