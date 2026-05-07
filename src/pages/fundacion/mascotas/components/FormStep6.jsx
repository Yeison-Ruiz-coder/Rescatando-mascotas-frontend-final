// src/pages/fundacion/mascotas/components/FormStep6.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageUploader from './ImageUploader';
import './FormStep6.css';

const FormStep6 = ({ form, setForm, errors, getImageUrl }) => {
  const { t } = useTranslation('nuevaMascota');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGaleriaImages = (images) => {
    console.log('Agregando imágenes a galería:', images.length);
    setForm(prev => ({
      ...prev,
      galeria_fotos: images,
      galeria_fotos_previews: images.map(i => i.preview)
    }));
  };

  const handleRemoveGaleriaImage = (index) => {
    console.log('Intentando eliminar imagen de galería en índice:', index);
    console.log('Imágenes actuales:', form.galeria_fotos);
    setForm(prev => {
      const newGaleria = prev.galeria_fotos.filter((_, i) => i !== index);
      const newPreviews = prev.galeria_fotos_previews.filter((_, i) => i !== index);
      console.log('Nuevas imágenes:', newGaleria);
      return {
        ...prev,
        galeria_fotos: newGaleria,
        galeria_fotos_previews: newPreviews
      };
    });
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
            images={form.galeria_fotos || []}
            onAdd={handleAddGaleriaImages}
            onRemove={handleRemoveGaleriaImage}
            maxFiles={10}
            multiple={true}
          />
          <small className="form-help">{t('galeria_help')}</small>
        </div>

        <div className="form-group full-width">
          <label>{t('video_url')}</label>
          <input
            type="url"
            name="video_url"
            value={form.video_url || ''}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
          />
          <small className="form-help">{t('video_help')}</small>
          {errors.video_url && <span className="error-msg">{errors.video_url}</span>}
        </div>
      </div>
    </div>
  );
};

export default FormStep6;