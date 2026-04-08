import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useMascotas from '../../../hooks/useMascotas';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import ImageUploader from '../../../components/common/ImageUploader/ImageUploader';
import MultiSelect from '../../../components/common/MultiSelect/MultiSelect';
import FormSection from '../../../components/common/FormSection/FormSection';
import mascotaService from '../../../services/mascotaService';
import './MascotaForm.css';

const MascotaForm = () => {
  const { t } = useTranslation('mascotas');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { formData, createMascota, updateMascota } = useMascotas();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});
  const [razas, setRazas] = useState([]);
  
  const [form, setForm] = useState({
    nombre_mascota: '',
    especie: '',
    razas: [],
    edad_aprox: '',
    genero: '',
    estado: 'En adopcion',
    lugar_rescate: '',
    descripcion: '',
    condiciones_especiales: '',
    necesita_hogar_temporal: false,
    apto_con_ninos: true,
    apto_con_otros_animales: true,
    vacunas: [],
    foto_principal: null,
    foto_principal_preview: null,
    galeria_fotos: [],
    galeria_fotos_previews: [],
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_salida: '',
  });

  const especies = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'];
  const generos = ['Macho', 'Hembra', 'Desconocido'];
  const estados = ['En adopcion', 'Rescatada', 'En acogida', 'Adoptado'];

  useEffect(() => {
    if (isEditing) {
      loadMascotaData();
    }
  }, [id]);

  const loadMascotaData = async () => {
    try {
      const response = await mascotaService.getMascota(id);
      if (response.success) {
        const mascota = response.data;
        setForm({
          nombre_mascota: mascota.nombre_mascota || '',
          especie: mascota.especie || '',
          razas: mascota.razas?.map(r => r.id) || [],
          edad_aprox: mascota.edad_aprox || '',
          genero: mascota.genero || '',
          estado: mascota.estado || 'En adopcion',
          lugar_rescate: mascota.lugar_rescate || '',
          descripcion: mascota.descripcion || '',
          condiciones_especiales: mascota.condiciones_especiales || '',
          necesita_hogar_temporal: mascota.necesita_hogar_temporal || false,
          apto_con_ninos: mascota.apto_con_ninos ?? true,
          apto_con_otros_animales: mascota.apto_con_otros_animales ?? true,
          vacunas: mascota.vacunas?.map(v => v.id) || [],
          foto_principal: null,
          foto_principal_preview: mascota.foto_principal ? `/storage/${mascota.foto_principal}` : null,
          galeria_fotos: [],
          galeria_fotos_previews: mascota.galeria_fotos?.map(f => `/storage/${f}`) || [],
          fecha_ingreso: mascota.fecha_ingreso?.split('T')[0] || new Date().toISOString().split('T')[0],
          fecha_salida: mascota.fecha_salida?.split('T')[0] || '',
        });
      }
    } catch (error) {
      console.error('Error loading mascota:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoPrincipalChange = (file, preview) => {
    setForm(prev => ({
      ...prev,
      foto_principal: file,
      foto_principal_preview: preview
    }));
  };

  const handleGaleriaChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newFiles = [...form.galeria_fotos];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setForm(prev => ({
              ...prev,
              galeria_fotos: [...prev.galeria_fotos, ...newFiles],
              galeria_fotos_previews: [...prev.galeria_fotos_previews, ...newPreviews]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeGaleriaImage = (index) => {
    setForm(prev => ({
      ...prev,
      galeria_fotos: prev.galeria_fotos.filter((_, i) => i !== index),
      galeria_fotos_previews: prev.galeria_fotos_previews.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre_mascota.trim()) newErrors.nombre_mascota = t('required_field');
    if (!form.especie) newErrors.especie = t('required_field');
    if (form.razas.length === 0) newErrors.razas = t('required_field');
    if (!form.genero) newErrors.genero = t('required_field');
    if (!form.descripcion.trim()) newErrors.descripcion = t('required_field');
    if (!isEditing && !form.foto_principal) newErrors.foto_principal = t('required_field');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const formDataToSend = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'galeria_fotos') {
        form.galeria_fotos.forEach(file => {
          formDataToSend.append('galeria_fotos[]', file);
        });
      } else if (key === 'razas' || key === 'vacunas') {
        form[key].forEach(item => {
          formDataToSend.append(`${key}[]`, item);
        });
      } else if (key === 'foto_principal' && form.foto_principal) {
        formDataToSend.append('foto_principal', form.foto_principal);
      } else if (key !== 'foto_principal_preview' && key !== 'galeria_fotos_previews') {
        formDataToSend.append(key, form[key]);
      }
    });
    
    let success;
    if (isEditing) {
      success = await updateMascota(id, formDataToSend);
    } else {
      success = await createMascota(formDataToSend);
    }
    
    setLoading(false);
    if (success) {
      navigate('/fundacion/mascotas');
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text={t('cargando')} />;
  }

  return (
    <div className="mascota-form-page">
      <div className="form-header">
        <h1>
          <i className="fas fa-paw"></i> 
          {isEditing ? t('editar_mascota') : t('registrar_mascota')}
        </h1>
        <p>{t('formulario_descripcion')}</p>
      </div>

      <form onSubmit={handleSubmit} className="mascota-form">
        {/* Sección 1: Información Básica */}
        <FormSection title={t('informacion_basica')} icon="info-circle">
          <div className="form-row">
            <div className="form-group">
              <label>{t('nombre_mascota')} <span className="required">*</span></label>
              <input
                type="text"
                name="nombre_mascota"
                value={form.nombre_mascota}
                onChange={handleChange}
                className={errors.nombre_mascota ? 'error' : ''}
                placeholder={t('nombre_mascota_placeholder')}
              />
              {errors.nombre_mascota && <span className="error-msg">{errors.nombre_mascota}</span>}
            </div>

            <div className="form-group">
              <label>{t('especie')} <span className="required">*</span></label>
              <select name="especie" value={form.especie} onChange={handleChange} className={errors.especie ? 'error' : ''}>
                <option value="">{t('seleccionar_especie')}</option>
                {especies.map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
              {errors.especie && <span className="error-msg">{errors.especie}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <MultiSelect
                label={t('razas')}
                options={formData.razas?.filter(r => !form.especie || r.especie === form.especie).map(r => ({ value: r.id, label: r.nombre_raza })) || []}
                value={form.razas}
                onChange={(val) => handleMultiSelectChange('razas', val)}
                required
                placeholder={t('seleccionar_razas')}
              />
              {errors.razas && <span className="error-msg">{errors.razas}</span>}
            </div>

            <div className="form-group">
              <label>{t('edad_aprox')}</label>
              <input
                type="number"
                name="edad_aprox"
                value={form.edad_aprox}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="30"
                placeholder={t('edad_placeholder')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('genero')} <span className="required">*</span></label>
              <div className="radio-group">
                {generos.map(gen => (
                  <label key={gen}>
                    <input type="radio" name="genero" value={gen} checked={form.genero === gen} onChange={handleChange} />
                    <span>{gen === 'Macho' ? '🐕 ' + t('macho') : gen === 'Hembra' ? '🐕‍🦺 ' + t('hembra') : '❓ ' + t('desconocido')}</span>
                  </label>
                ))}
              </div>
              {errors.genero && <span className="error-msg">{errors.genero}</span>}
            </div>

            <div className="form-group">
              <label>{t('estado')}</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                {estados.map(est => <option key={est} value={est}>{est}</option>)}
              </select>
            </div>
          </div>
        </FormSection>

        {/* Sección 2: Ubicación y Descripción */}
        <FormSection title={t('ubicacion_descripcion')} icon="map-marker-alt">
          <div className="form-group">
            <label>{t('lugar_rescate')}</label>
            <input
              type="text"
              name="lugar_rescate"
              value={form.lugar_rescate}
              onChange={handleChange}
              placeholder={t('lugar_rescate_placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('descripcion')} <span className="required">*</span></label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="5"
              className={errors.descripcion ? 'error' : ''}
              placeholder={t('descripcion_placeholder')}
            ></textarea>
            {errors.descripcion && <span className="error-msg">{errors.descripcion}</span>}
          </div>

          <div className="form-group">
            <label>{t('condiciones_especiales')}</label>
            <textarea
              name="condiciones_especiales"
              value={form.condiciones_especiales}
              onChange={handleChange}
              rows="3"
              placeholder={t('condiciones_placeholder')}
            ></textarea>
          </div>
        </FormSection>

        {/* Sección 3: Salud y Características */}
        <FormSection title={t('salud_caracteristicas')} icon="heartbeat">
          <div className="checkbox-group">
            <label className="switch">
              <input type="checkbox" name="necesita_hogar_temporal" checked={form.necesita_hogar_temporal} onChange={handleChange} />
              <span className="slider round"></span>
              <span className="switch-label">{t('necesita_hogar_temporal')}</span>
            </label>
          </div>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input type="checkbox" name="apto_con_ninos" checked={form.apto_con_ninos} onChange={handleChange} />
              <span>👶 {t('apto_con_ninos')}</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="apto_con_otros_animales" checked={form.apto_con_otros_animales} onChange={handleChange} />
              <span>🐕 {t('apto_con_otros_animales')}</span>
            </label>
          </div>

          <div className="form-group">
            <MultiSelect
              label={t('vacunas')}
              options={formData.vacunas?.map(v => ({ value: v.id, label: `${v.nombre_vacuna} (${v.frecuencia_dias} días)` })) || []}
              value={form.vacunas}
              onChange={(val) => handleMultiSelectChange('vacunas', val)}
              placeholder={t('seleccionar_vacunas')}
            />
          </div>
        </FormSection>

        {/* Sección 4: Galería de Fotos */}
        <FormSection title={t('galeria_fotos')} icon="images">
          <ImageUploader
            label={t('foto_principal')}
            name="foto_principal"
            onImageChange={handleFotoPrincipalChange}
            currentImage={form.foto_principal_preview}
            required={!isEditing}
          />
          {errors.foto_principal && <span className="error-msg">{errors.foto_principal}</span>}

          <div className="form-group">
            <label>{t('galeria_fotos')}</label>
            <div className="galeria-upload">
              <label className="galeria-upload-btn">
                <i className="fas fa-plus"></i> {t('agregar_fotos')}
                <input type="file" multiple accept="image/*" onChange={handleGaleriaChange} style={{ display: 'none' }} />
              </label>
            </div>
            {form.galeria_fotos_previews.length > 0 && (
              <div className="galeria-previews">
                {form.galeria_fotos_previews.map((preview, idx) => (
                  <div key={idx} className="galeria-preview-item">
                    <img src={preview} alt={`Galeria ${idx}`} />
                    <button type="button" onClick={() => removeGaleriaImage(idx)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Sección 5: Fechas */}
        <FormSection title={t('fechas')} icon="calendar-alt">
          <div className="form-row">
            <div className="form-group">
              <label>{t('fecha_ingreso')}</label>
              <input type="date" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t('fecha_salida')}</label>
              <input type="date" name="fecha_salida" value={form.fecha_salida} onChange={handleChange} />
            </div>
          </div>
        </FormSection>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/fundacion/mascotas')}>
            <i className="fas fa-times"></i> {t('cancelar')}
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            {isEditing ? t('actualizar_mascota') : t('registrar_mascota')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MascotaForm;