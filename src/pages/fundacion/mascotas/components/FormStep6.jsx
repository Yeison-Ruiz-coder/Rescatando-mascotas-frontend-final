// src/pages/fundacion/mascotas/components/FormStep6.jsx
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "../../../../components/common/ImageUploader/ImageUploader";
import "./FormStep6.css";

const FormStep6 = ({
  form,
  setForm,
  errors,
  getImageUrl,
  galeriaExistente = [],
  onRemoveExistingFoto,
}) => {
  const { t } = useTranslation("nuevaMascota");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // ✅ CORREGIDO: Manejar nuevas fotos de galería
  const handleGaleriaChange = useCallback((files, previews) => {
    console.log("📸 Galería - Archivos recibidos:", files);
    console.log("📸 Galería - ¿Es array?", Array.isArray(files));
    console.log("📸 Galería - Tipo de cada elemento:", files?.map(f => f instanceof File ? "File" : typeof f));
    
    // Asegurar que files sea siempre un array de File objects
    let validFiles = [];
    if (files) {
      // Si files es un array
      if (Array.isArray(files)) {
        validFiles = files.filter(f => f instanceof File);
      } 
      // Si files es un solo File
      else if (files instanceof File) {
        validFiles = [files];
      }
    }
    
    setForm((prev) => ({
      ...prev,
      galeria_fotos: validFiles, // Guardar SOLO los archivos File
      galeria_fotos_previews: previews || [],
    }));
  }, [setForm]);

  // ✅ CORREGIDO: Manejar foto principal
  const handleMainPhotoChange = useCallback((file, preview) => {
    console.log("📸 Foto principal - Archivo:", file instanceof File ? file.name : file);
    
    setForm((prev) => ({
      ...prev,
      foto_principal: file instanceof File ? file : null,
      foto_principal_preview: preview,
    }));
  }, [setForm]);

  const handleRemoveMainPhoto = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      foto_principal: null,
      foto_principal_preview: null,
    }));
  }, [setForm]);

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

        {/* Galería FOTOS EXISTENTES (en edición) */}
        {galeriaExistente && galeriaExistente.length > 0 && (
          <div className="form-group full-width">
            <label>
              {t("fotos_existentes", { defaultValue: "Fotos actuales" })}
            </label>
            <div className="image-uploader-preview">
              {galeriaExistente.map((foto, idx) => (
                <div key={`existente-${idx}`} className="image-preview-item">
                  <img
                    src={foto.url}
                    alt={`Foto existente ${idx + 1}`}
                    onError={(e) => {
                      console.error("❌ Error cargando imagen:", foto.url);
                      e.target.src = "https://placehold.co/120x120?text=Error";
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveExistingFoto?.(idx, foto.path || foto.url);
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
                defaultValue:
                  "Estas fotos se mantendrán. Haz clic en la X para eliminarlas.",
              })}
            </small>
          </div>
        )}

        {/* Subir nuevas fotos - MODO MÚLTIPLE */}
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
          {/* Debug: mostrar cuántas fotos nuevas hay */}
          {form.galeria_fotos?.length > 0 && (
            <small className="form-help" style={{ color: "var(--color-success)" }}>
              ✅ {form.galeria_fotos.length} foto(s) nueva(s) seleccionada(s)
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

export default FormStep6;