// src/pages/fundacion/mascotas/components/FormStep6.jsx
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "../../../../components/common/ImageUploader/ImageUploader";
import "./FormStep6.css";

// ===== COMPONENTE PRINCIPAL =====
const FormStep6 = ({
  form,
  setForm,
  errors,
  getImageUrl,
  galeriaExistente = [],
  onRemoveExistingFoto,
}) => {
  const { t } = useTranslation("nuevaMascota");

  // ===== CALLBACKS =====
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, [setForm]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  const handleGaleriaChange = useCallback((files, previews) => {
    let validFiles = [];
    if (files) {
      if (Array.isArray(files)) {
        validFiles = files.filter(f => f instanceof File);
      } else if (files instanceof File) {
        validFiles = [files];
      }
    }
    
    setForm(prev => ({
      ...prev,
      galeria_fotos: validFiles,
      galeria_fotos_previews: previews || [],
    }));
  }, [setForm]);

  const handleMainPhotoChange = useCallback((file, preview) => {
    setForm(prev => ({
      ...prev,
      foto_principal: file instanceof File ? file : null,
      foto_principal_preview: preview,
    }));
  }, [setForm]);

  const handleRemoveMainPhoto = useCallback(() => {
    setForm(prev => ({
      ...prev,
      foto_principal: null,
      foto_principal_preview: null,
    }));
  }, [setForm]);

  const hasGaleriaFotos = form.galeria_fotos?.length > 0;

  return (
    <div className="form-step">
      <h2>
        <i className="fas fa-camera"></i> {t("steps.galeria_fotos")}
      </h2>

      <div className="form-grid">
        {/* Foto Principal */}
        <div className="form-group full-width">
          <label>
            {t("foto_principal")} <span className="required">*</span>
          </label>
          <ImageUploader
            label=""
            name="foto_principal"
            multiple={false}
            currentImage={form.foto_principal_preview}
            onImageChange={handleMainPhotoChange}
            required={true}
            maxSize={5}
          />
          {errors.foto_principal && (
            <span className="error-msg">{errors.foto_principal}</span>
          )}
        </div>

        {/* Fotos Existentes (Edición) */}
        {galeriaExistente.length > 0 && (
          <ExistingPhotos
            fotos={galeriaExistente}
            onRemove={onRemoveExistingFoto}
            t={t}
          />
        )}

        {/* Subir nuevas fotos */}
        <div className="form-group full-width">
          <label>{t("galeria_fotos")}</label>
          <ImageUploader
            label=""
            name="galeria_fotos"
            multiple={true}
            maxFiles={10}
            currentImages={form.galeria_fotos_previews || []}
            onImageChange={handleGaleriaChange}
            maxSize={5}
          />
          <small className="form-help">{t("galeria_help")}</small>
          {hasGaleriaFotos && (
            <small className="form-help" style={{ color: "var(--color-success)" }}>
              ✅ {form.galeria_fotos.length} {t("fotos_seleccionadas")}
            </small>
          )}
        </div>

        {/* Video URL */}
        <div className="form-group full-width">
          <label>{t("video_url")}</label>
          <input
            type="url"
            name="video_url"
            value={form.video_url || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="https://youtube.com/watch?v=..."
          />
          <small className="form-help">{t("video_help")}</small>
          {errors.video_url && (
            <span className="error-msg">{errors.video_url}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTES SECUNDARIOS =====

const ExistingPhotos = ({ fotos, onRemove, t }) => (
  <div className="form-group full-width">
    <label>{t("fotos_existentes", { defaultValue: "Fotos actuales" })}</label>
    <div className="image-uploader-preview">
      {fotos.map((foto, idx) => (
        <div key={`existente-${idx}`} className="image-preview-item">
          <img
            src={foto.url}
            alt={`Foto existente ${idx + 1}`}
            onError={(e) => {
              e.target.src = "https://placehold.co/120x120?text=Error";
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.(idx, foto.path || foto.url);
            }}
            title="Eliminar foto"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
    <small className="form-help">
      {t("fotos_existentes_help", {
        defaultValue: "Estas fotos se mantendrán. Haz clic en la X para eliminarlas.",
      })}
    </small>
  </div>
);

export default FormStep6;