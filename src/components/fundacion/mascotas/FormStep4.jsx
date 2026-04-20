// src/components/fundacion/mascotas/FormStep4.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageUploader from './ImageUploader';

const FormStep4 = ({ form, setForm, errors, getImageUrl }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleAddGaleriaImages = (images) => {
    setForm(prev => ({
      ...prev,
      galeria_fotos: images.map(i => i.file),
      galeria_fotos_previews: images.map(i => i.preview)
    }));
  };

  const handleRemoveGaleriaImage = (index) => {
    setForm(prev => ({
      ...prev,
      galeria_fotos: prev.galeria_fotos.filter((_, i) => i !== index),
      galeria_fotos_previews: prev.galeria_fotos_previews.filter((_, i) => i !== index)
    }));
  };

  const handleAddMainPhoto = (images) => {
    if (images.length > 0) {
      setForm(prev => ({
        ...prev,
        foto_principal: images[0].file,
        foto_principal_preview: images[0].preview
      }));
    }
  };

  const handleRemoveMainPhoto = () => {
    setForm(prev => ({
      ...prev,
      foto_principal: null,
      foto_principal_preview: null
    }));
  };

  return (
    <div className="form-step">
      <h2><i className="fas fa-camera"></i> {t('steps.galeria_fotos')}</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>{t('foto_principal')} <span className="required">*</span></label>
          {form.foto_principal_preview ? (
            <div className="image-uploader-preview">
              <div className="image-preview-item main">
                <img src={form.foto_principal_preview} alt={t('foto_principal')} />
                <button type="button" onClick={handleRemoveMainPhoto}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ) : (
            <ImageUploader
              images={[]}
              onAdd={handleAddMainPhoto}
              onRemove={() => {}}
              maxFiles={1}
              multiple={false}
            />
          )}
          {errors.foto_principal && <span className="error-msg">{errors.foto_principal}</span>}
        </div>

        <div className="form-group full-width">
          <label>{t('galeria_fotos')}</label>
          <ImageUploader
            images={form.galeria_fotos_previews.map((preview, idx) => ({ 
              preview, 
              file: form.galeria_fotos[idx] 
            }))}
            onAdd={handleAddGaleriaImages}
            onRemove={handleRemoveGaleriaImage}
            maxFiles={10}
            multiple={true}
          />
          <small className="form-help">Puedes seleccionar hasta 10 imágenes adicionales (máx 2MB cada una)</small>
        </div>
      </div>
    </div>
  );
};

export default FormStep4;