import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import adminService from "../../../services/adminService";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./UsuarioForm.css";

const UsuarioForm = () => {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) {
    return <LoadingSpinner text={t("cargando_usuario", "Cargando usuario...")} />;
  }

  return (
    <div className="usuario-form-page">
      <div className="usuario-form-card">
        <div className="usuario-form-header">
          <div>
            <h1>{isEditing ? t("editar_usuario", "Editar usuario") : t("nuevo_usuario", "Nuevo usuario")}</h1>
            <p>{t("usuario_form_desc", "Completa los datos para administrar la cuenta.")}</p>
          </div>
        </div>

        <form className="usuario-form" onSubmit={handleSubmit}>
          <div className="usuario-form-grid">
            <div className="usuario-form-field">
              <label>{t("nombre", "Nombre")}</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={t("nombre_placeholder", "Nombre completo")}
                required
              />
            </div>

            <div className="usuario-form-field">
              <label>{t("email", "Correo electrónico")}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("email_placeholder", "correo@ejemplo.com")}
                required
              />
            </div>

            <div className="usuario-form-field">
              <label>{t("tipo_usuario", "Tipo")}</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="usuario">{t("usuario", "Usuario")}</option>
                <option value="fundacion">{t("fundacion", "Fundación")}</option>
                <option value="veterinaria">{t("veterinaria", "Veterinaria")}</option>
              </select>
            </div>

            <div className="usuario-form-field">
              <label>{t("estado_usuario", "Estado")}</label>
              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="activo">{t("activo", "Activo")}</option>
                <option value="inactivo">{t("inactivo", "Inactivo")}</option>
                <option value="pendiente">{t("pendiente", "Pendiente")}</option>
              </select>
            </div>

            {showEntityFields && (
              <>
                <div className="usuario-form-field usuario-form-full">
                  <label>{t("nombre_entidad", "Nombre de la entidad")}</label>
                  <input
                    type="text"
                    name="nombre_entidad"
                    value={formData.nombre_entidad}
                    onChange={handleChange}
                    placeholder={t("nombre_entidad_placeholder", "Nombre de la fundación o clínica")}
                  />
                </div>
                <div className="usuario-form-field">
                  <label>{t("telefono", "Teléfono")}</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder={t("telefono_placeholder", "+57 300 000 0000")}
                  />
                </div>
                <div className="usuario-form-field usuario-form-full">
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

            <div className="usuario-form-field">
              <label>{t("contraseña", "Contraseña")}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("contraseña_placeholder", "Dejar vacío para no cambiar")}
                autoComplete={isEditing ? "new-password" : "new-password"}
              />
            </div>

            <div className="usuario-form-field">
              <label>{t("confirmar_contraseña", "Confirmar contraseña")}</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder={t("confirmar_contraseña_placeholder", "Repite la contraseña")}
                autoComplete={isEditing ? "new-password" : "new-password"}
              />
            </div>
          </div>

          <div className="usuario-form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              {t("cancelar", "Cancelar")}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t("guardando", "Guardando...") : t("guardar", "Guardar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm;
