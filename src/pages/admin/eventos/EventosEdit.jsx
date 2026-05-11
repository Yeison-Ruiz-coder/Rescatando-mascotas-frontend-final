// src/pages/admin/eventos/EventosEdit.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  X,
  Loader,
  Tag,
  Users,
  DollarSign,
  User,
  Layers,
} from "lucide-react";
import api from "../../../services/api";
import "./EventosForm.css";

const AdminEventosEdit = () => {
  const { t } = useTranslation("eventos");
  const { id } = useParams();
  const navigate = useNavigate();
  const fechaInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [formData, setFormData] = useState({
    nombre_evento: "",
    lugar_evento: "",
    descripcion: "",
    fecha_evento: "",
    fecha_fin: "",
    capacidad_maxima: "",
    costo: "",
    organizador: "",
    telefono_contacto: "",
    email_contacto: "",
    categoria: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [imagen, setImagen] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Función para abrir el calendario nativo
  const openCalendar = () => {
    if (fechaInputRef.current) {
      if (fechaInputRef.current.showPicker) {
        fechaInputRef.current.showPicker();
      } else {
        fechaInputRef.current.focus();
        fechaInputRef.current.click();
      }
    }
  };

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage")
      ? `${baseUrl}${url}`
      : `${baseUrl}/storage/${url}`;
  }, []);

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]{0,15}$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t("image_max_size"));
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert(t("image_only"));
        return;
      }
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setExistingImage(null);
      setRemoveImage(false);
    }
  };

  const handleRemoveExistingImage = () => {
    setExistingImage(null);
    setImagen(null);
    setPreviewImage(null);
    setRemoveImage(true);
  };

  useEffect(() => {
    const loadEvento = async () => {
      try {
        const response = await api.get(`/admin/eventos/${id}`);
        const evento = response.data.data || response.data;

        let tagsArray = [];
        if (evento.tags) {
          if (Array.isArray(evento.tags)) {
            tagsArray = evento.tags;
          } else if (typeof evento.tags === "string") {
            try {
              tagsArray = JSON.parse(evento.tags);
            } catch (e) {
              tagsArray = [];
            }
          }
        }

        setFormData({
          nombre_evento: evento.nombre_evento || "",
          lugar_evento: evento.lugar_evento || "",
          descripcion: evento.descripcion || "",
          fecha_evento: evento.fecha_evento
            ? evento.fecha_evento.slice(0, 16)
            : "",
          fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : "",
          capacidad_maxima: evento.capacidad_maxima || "",
          costo: evento.costo || "",
          organizador: evento.organizador || "",
          telefono_contacto: evento.telefono_contacto || "",
          email_contacto: evento.email_contacto || "",
          categoria: evento.categoria || "",
          tags: tagsArray,
        });

        if (evento.imagen_url) setExistingImage(getImageUrl(evento.imagen_url));
      } catch (error) {
        alert(t("error_load"));
        navigate("/admin/eventos");
      } finally {
        setInitialLoading(false);
      }
    };
    loadEvento();
  }, [id, navigate, getImageUrl, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        if (key === "tags" && formData.tags.length > 0) {
          formData.tags.forEach((tag) => {
            formDataToSend.append("tags[]", tag);
          });
        } else if (key === "tags" && formData.tags.length === 0) {
          formDataToSend.append("tags[]", "");
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    if (imagen) formDataToSend.append("imagen", imagen);
    if (removeImage) formDataToSend.append("remover_imagen", "true");
    formDataToSend.append("_method", "PUT");

    try {
      await api.post(`/admin/eventos/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/admin/eventos/${id}`);
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      else alert(error.response?.data?.message || t("error_update"));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="admin-eventos-form-loading">
        <Loader size={40} className="spinner" />
        <p>{t("loading_event")}</p>
      </div>
    );
  }

  return (
    <div className="admin-eventos-form-container">
      {/* BOTÓN VOLVER FUERA DEL FORMULARIO */}
      <div className="back-button-wrapper">
        <Link to="/admin/eventos" className="btn-back-gradient">
          <ArrowLeft size={18} />
          {t("back_to_events")}
        </Link>
      </div>

      {/* FORMULARIO */}
      <div className="admin-eventos-form-card">
        <div className="form-header">
          {/* Ya no incluir el back-link aquí */}
          <h1>✨ {t("create_event")}</h1>
          <p>{t("create_event_desc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="eventos-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-group required">
                <label>
                  <FileText size={16} /> {t("event_name")}
                </label>
                <input
                  type="text"
                  name="nombre_evento"
                  value={formData.nombre_evento}
                  onChange={handleChange}
                  required
                />
                {errors.nombre_evento && (
                  <span className="error-message">
                    {errors.nombre_evento[0]}
                  </span>
                )}
              </div>

              <div className="form-group required">
                <label>
                  <MapPin size={16} /> {t("location")}
                </label>
                <input
                  type="text"
                  name="lugar_evento"
                  value={formData.lugar_evento}
                  onChange={handleChange}
                  required
                />
                {errors.lugar_evento && (
                  <span className="error-message">
                    {errors.lugar_evento[0]}
                  </span>
                )}
              </div>

              <div
                className="form-group required"
                style={{ position: "relative" }}
              >
                <label>
                  <Calendar size={16} /> {t("start_date")} *
                </label>
                <input
                  ref={fechaInputRef}
                  type="datetime-local"
                  name="fecha_evento"
                  value={formData.fecha_evento}
                  onChange={handleChange}
                  required
                />
                <div className="calendar-icon-custom" onClick={openCalendar}>
                  <Calendar size={16} />
                </div>
                {errors.fecha_evento && (
                  <span className="error-message">
                    {errors.fecha_evento[0]}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} /> {t("end_date")}
                </label>
                <input
                  type="datetime-local"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  <Users size={16} /> {t("max_capacity")}
                </label>
                <input
                  type="text"
                  name="capacidad_maxima"
                  value={formData.capacidad_maxima}
                  onChange={handleNumberChange}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group required">
                <label>
                  <FileText size={16} /> {t("description")}
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="5"
                  required
                />
                {errors.descripcion && (
                  <span className="error-message">{errors.descripcion[0]}</span>
                )}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    <DollarSign size={16} /> {t("cost")}
                  </label>
                  <input
                    type="text"
                    name="costo"
                    value={formData.costo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Layers size={16} /> {t("category")}
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Tag size={16} /> {t("tags")}
                </label>
                <div className="tags-input-container">
                  <div className="tags-list">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="tag">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tags-input-wrapper">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      placeholder={t("tags_placeholder")}
                    />
                    <button type="button" onClick={handleAddTag}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <ImageIcon size={16} /> {t("event_image")}
                </label>
                <div className="image-upload-area">
                  {existingImage || previewImage ? (
                    <div className="image-preview">
                      <img src={previewImage || existingImage} alt="Preview" />
                      <button type="button" onClick={handleRemoveExistingImage}>
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <div className="upload-placeholder">
                        <ImageIcon size={32} />
                        <span>{t("click_to_upload")}</span>
                        <small>{t("image_max_size_text")}</small>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/admin/eventos" className="btn-cancel">
              <X size={16} /> {t("cancel")}
            </Link>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <Loader size={20} className="spinner" />
              ) : (
                <Save size={20} />
              )}
              {loading ? t("saving") : t("save_changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEventosEdit;
