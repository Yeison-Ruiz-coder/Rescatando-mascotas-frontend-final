import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './NuevaMascota.css';

const NuevaMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [razasList, setRazasList] = useState([]);
  const [vacunasList, setVacunasList] = useState([]);
  
  // Verificar si el usuario es de tipo fundacion
  const esFundacion = user?.tipo === 'fundacion';
  const fundacionId = esFundacion ? user?.fundacion?.id : null;
  
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

  const totalSteps = 4;
  const steps = [
    { number: 1, title: t('steps.informacion_basica'), icon: 'fas fa-info-circle' },
    { number: 2, title: t('steps.ubicacion_descripcion'), icon: 'fas fa-map-marker-alt' },
    { number: 3, title: t('steps.salud_vacunas'), icon: 'fas fa-heartbeat' },
    { number: 4, title: t('steps.galeria_fotos'), icon: 'fas fa-images' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!esFundacion && !initialLoading) {
      toast.error(t('mensajes.solo_fundacion'));
    }
  }, [esFundacion, initialLoading, t]);

  useEffect(() => {
    if (form.especie && razasList.length > 0) {
      const razasIdsValidas = razasList
        .filter(r => r.especie === form.especie)
        .map(r => r.id);
      
      const razasActualizadas = form.razas.filter(id => razasIdsValidas.includes(id));
      
      if (razasActualizadas.length !== form.razas.length) {
        setForm(prev => ({ ...prev, razas: razasActualizadas }));
      }
    } else if (!form.especie && form.razas.length > 0) {
      setForm(prev => ({ ...prev, razas: [] }));
    }
  }, [form.especie, razasList]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      
      let razas = [];
      let vacunas = [];
      
      try {
        const razasRes = await api.get('/admin/razas');
        if (razasRes.data && razasRes.data.data) {
          razas = razasRes.data.data;
        }
      } catch (e) {
        console.log('No se pudieron cargar razas, usando datos de ejemplo');
      }
      
      try {
        const vacunasRes = await api.get('/admin/tipos-vacunas');
        if (vacunasRes.data && vacunasRes.data.data) {
          vacunas = vacunasRes.data.data;
        }
      } catch (e) {
        console.log('No se pudieron cargar vacunas, usando datos de ejemplo');
      }
      
      setRazasList(razas.length > 0 ? razas : [
        { id: 1, nombre_raza: 'Labrador', especie: 'Perro' },
        { id: 2, nombre_raza: 'Golden Retriever', especie: 'Perro' },
        { id: 3, nombre_raza: 'Pastor Alemán', especie: 'Perro' },
        { id: 4, nombre_raza: 'Bulldog', especie: 'Perro' },
        { id: 5, nombre_raza: 'Poodle', especie: 'Perro' },
        { id: 6, nombre_raza: 'Chihuahua', especie: 'Perro' },
        { id: 7, nombre_raza: 'Siames', especie: 'Gato' },
        { id: 8, nombre_raza: 'Persa', especie: 'Gato' },
        { id: 9, nombre_raza: 'Maine Coon', especie: 'Gato' },
        { id: 10, nombre_raza: 'Conejo Belier', especie: 'Conejo' },
      ]);
      
      setVacunasList(vacunas.length > 0 ? vacunas : [
        { id: 1, nombre_vacuna: 'Rabia', frecuencia_dias: 365 },
        { id: 2, nombre_vacuna: 'Parvovirus', frecuencia_dias: 365 },
        { id: 3, nombre_vacuna: 'Moquillo', frecuencia_dias: 365 },
        { id: 4, nombre_vacuna: 'Hepatitis', frecuencia_dias: 365 },
        { id: 5, nombre_vacuna: 'Leptospirosis', frecuencia_dias: 365 },
        { id: 6, nombre_vacuna: 'Triple Felina', frecuencia_dias: 365 },
      ]);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setRazasList([
        { id: 1, nombre_raza: 'Labrador', especie: 'Perro' },
        { id: 2, nombre_raza: 'Golden Retriever', especie: 'Perro' },
        { id: 3, nombre_raza: 'Pastor Alemán', especie: 'Perro' },
        { id: 4, nombre_raza: 'Siames', especie: 'Gato' },
        { id: 5, nombre_raza: 'Persa', especie: 'Gato' },
      ]);
      setVacunasList([
        { id: 1, nombre_vacuna: 'Rabia', frecuencia_dias: 365 },
        { id: 2, nombre_vacuna: 'Parvovirus', frecuencia_dias: 365 },
        { id: 3, nombre_vacuna: 'Moquillo', frecuencia_dias: 365 },
      ]);
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

  const handleMultiSelect = (name, value) => {
    if (name === 'razas' && !form.especie) {
      toast.warning(t('mensajes.seleccionar_especie_primero'));
      return;
    }
    
    setForm(prev => {
      const currentValues = [...prev[name]];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const handleFotoPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('mensajes.imagen_grande'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          foto_principal: file,
          foto_principal_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGaleriaChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...form.galeria_fotos];
    const newPreviews = [...form.galeria_fotos_previews];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(t('mensajes.imagen_excluida', { nombre: file.name }));
          return;
        }
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          setForm(prev => ({
            ...prev,
            galeria_fotos: newFiles,
            galeria_fotos_previews: newPreviews
          }));
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

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!form.nombre_mascota.trim()) newErrors.nombre_mascota = t('errores.nombre_requerido');
        if (!form.especie) newErrors.especie = t('errores.especie_requerida');
        if (form.razas.length === 0) newErrors.razas = t('errores.razas_requeridas');
        if (!form.edad_aprox) newErrors.edad_aprox = t('errores.edad_requerida');
        if (!form.genero) newErrors.genero = t('errores.genero_requerido');
        if (!form.estado) newErrors.estado = t('errores.estado_requerido');
        break;
      case 2:
        if (!form.lugar_rescate.trim()) newErrors.lugar_rescate = t('errores.lugar_rescate_requerido');
        if (!form.descripcion.trim()) newErrors.descripcion = t('errores.descripcion_requerida');
        break;
      case 3:
        break;
      case 4:
        if (!form.foto_principal) newErrors.foto_principal = t('errores.foto_principal_requerida');
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    if (!esFundacion) {
      toast.error(t('mensajes.solo_fundacion'));
      return;
    }
    
    setLoading(true);
    
    const formDataToSend = new FormData();
    const fundacionIdCorrecto = user?.fundacion?.id;
    
    if (!fundacionIdCorrecto) {
      toast.error(t('mensajes.sin_perfil_fundacion'));
      setLoading(false);
      return;
    }
    
    formDataToSend.append('fundacion_id', fundacionIdCorrecto);
    
    Object.keys(form).forEach(key => {
      if (key === 'galeria_fotos') {
        form.galeria_fotos.forEach(file => {
          formDataToSend.append('galeria_fotos[]', file);
        });
      } else if (key === 'razas') {
        form.razas.forEach(item => {
          formDataToSend.append('razas[]', item);
        });
      } else if (key === 'vacunas') {
        form.vacunas.forEach(item => {
          formDataToSend.append('vacunas[]', item);
        });
      } else if (key === 'foto_principal' && form.foto_principal) {
        formDataToSend.append('foto_principal', form.foto_principal);
      } else if (key !== 'foto_principal_preview' && key !== 'galeria_fotos_previews') {
        if (typeof form[key] === 'boolean') {
          formDataToSend.append(key, form[key] ? 1 : 0);
        } else {
          formDataToSend.append(key, form[key]);
        }
      }
    });
    
    try {
      const response = await api.post('/entity/mascotas', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success(t('mensajes.registro_exitoso'));
        navigate('/fundacion/mascotas');
      } else {
        toast.error(response.data.message || t('mensajes.error_registro'));
      }
    } catch (error) {
      console.error('Error detallado:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors || 
                       t('mensajes.error_registro');
      toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="nueva-mascota-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando')} />
        </div>
      </div>
    );
  }

  if (!esFundacion) {
    return (
      <div className="nueva-mascota-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-building"></i>
            <h2>{t('acceso_no_autorizado.titulo')}</h2>
            <p>{t('acceso_no_autorizado.mensaje')}</p>
            <p>{t('acceso_no_autorizado.tu_tipo')}: <strong>{user?.tipo || t('acceso_no_autorizado.no_especificado')}</strong></p>
            <button onClick={() => navigate('/')} className="btn-prev">
              <i className="fas fa-arrow-left"></i> {t('acceso_no_autorizado.volver_inicio')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nueva-mascota-page">
      <div className="container">
        <div className="form-header">
          <h1>
            <i className="fas fa-paw"></i> {t('titulo')}
          </h1>
          <p>{t('subtitulo')}</p>
          <div className="fundacion-info">
            <i className="fas fa-building"></i> {t('fundacion_label')}: <strong>{user?.fundacion?.Nombre_1 || user?.nombre || user?.email}</strong>
          </div>
        </div>

        <div className="steps-container">
          {steps.map(step => (
            <div
              key={step.number}
              className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              onClick={() => currentStep > step.number && setCurrentStep(step.number)}
            >
              <div className="step-circle">
                {currentStep > step.number ? <i className="fas fa-check"></i> : step.number}
              </div>
              <div className="step-label">
                <i className={step.icon}></i>
                <span>{step.title}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mascota-form">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="form-step animate-fadeIn">
              <h2><i className="fas fa-info-circle"></i> {t('informacion_basica')}</h2>
              
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
                    {especies.map(esp => <option key={esp} value={esp}>{esp === 'Perro' ? '🐕 Perro' : esp === 'Gato' ? '🐱 Gato' : esp}</option>)}
                  </select>
                  {errors.especie && <span className="error-msg">{errors.especie}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('razas')} <span className="required">*</span></label>
                  <div className="multi-select">
                    {!form.especie ? (
                      <p className="form-help" style={{ color: '#ff8c42' }}>
                        <i className="fas fa-info-circle"></i> {t('seleccionar_especie_primero')}
                      </p>
                    ) : razasList.length === 0 ? (
                      <p className="form-help">{t('cargando_razas')}</p>
                    ) : (
                      <>
                        {razasList
                          .filter(r => r.especie === form.especie)
                          .map(raza => (
                            <label key={raza.id} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={form.razas.includes(raza.id)}
                                onChange={() => handleMultiSelect('razas', raza.id)}
                              />
                              {raza.nombre_raza}
                            </label>
                          ))}
                        {razasList.filter(r => r.especie === form.especie).length === 0 && (
                          <p className="form-help">{t('sin_razas')} {form.especie}</p>
                        )}
                      </>
                    )}
                  </div>
                  {errors.razas && <span className="error-msg">{errors.razas}</span>}
                </div>

                <div className="form-group">
                  <label>{t('edad_aprox')} <span className="required">*</span></label>
                  <input
                    type="number"
                    name="edad_aprox"
                    value={form.edad_aprox}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    max="30"
                    placeholder={t('edad_placeholder')}
                    className={errors.edad_aprox ? 'error' : ''}
                  />
                  {errors.edad_aprox && <span className="error-msg">{errors.edad_aprox}</span>}
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
                  <label>{t('estado_actual')} <span className="required">*</span></label>
                  <select name="estado" value={form.estado} onChange={handleChange} className={errors.estado ? 'error' : ''}>
                    {estados.map(est => (
                      <option key={est} value={est}>
                        {est === 'En adopcion' ? t('estado_en_adopcion') : 
                         est === 'Adoptado' ? t('estado_adoptado') : 
                         est === 'Rescatada' ? t('estado_rescatada') : 
                         t('estado_en_acogida')}
                      </option>
                    ))}
                  </select>
                  {errors.estado && <span className="error-msg">{errors.estado}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Ubicación y Descripción */}
          {currentStep === 2 && (
            <div className="form-step animate-fadeIn">
              <h2><i className="fas fa-map-marker-alt"></i> {t('ubicacion_descripcion')}</h2>
              
              <div className="form-group">
                <label>{t('lugar_rescate')} <span className="required">*</span></label>
                <input
                  type="text"
                  name="lugar_rescate"
                  value={form.lugar_rescate}
                  onChange={handleChange}
                  placeholder={t('lugar_rescate_placeholder')}
                  className={errors.lugar_rescate ? 'error' : ''}
                />
                {errors.lugar_rescate && <span className="error-msg">{errors.lugar_rescate}</span>}
              </div>

              <div className="form-group">
                <label>{t('descripcion')} <span className="required">*</span></label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="5"
                  placeholder={t('descripcion_placeholder')}
                  className={errors.descripcion ? 'error' : ''}
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
            </div>
          )}

          {/* Paso 3: Salud y Vacunas */}
          {currentStep === 3 && (
            <div className="form-step animate-fadeIn">
              <h2><i className="fas fa-syringe"></i> {t('salud_vacunas')}</h2>
              
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
                <label>{t('vacunas_aplicadas')}</label>
                <div className="multi-select vacunas-grid">
                  {vacunasList.map(vacuna => (
                    <label key={vacuna.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.vacunas.includes(vacuna.id)}
                        onChange={() => handleMultiSelect('vacunas', vacuna.id)}
                      />
                      {vacuna.nombre_vacuna}
                      {vacuna.frecuencia_dias && <small> ({t('frecuencia_dias', { dias: vacuna.frecuencia_dias })})</small>}
                    </label>
                  ))}
                  {vacunasList.length === 0 && (
                    <p className="form-help">{t('sin_vacunas')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Galería de Fotos */}
          {currentStep === 4 && (
            <div className="form-step animate-fadeIn">
              <h2><i className="fas fa-camera"></i> {t('galeria_fotos')}</h2>
              
              <div className="form-group">
                <label>{t('foto_principal')} <span className="required">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoPrincipalChange}
                  className={errors.foto_principal ? 'error' : ''}
                />
                <div className="form-help">
                  <i className="fas fa-info-circle"></i> {t('formatos_imagen')}
                </div>
                {errors.foto_principal && <span className="error-msg">{errors.foto_principal}</span>}
                {form.foto_principal_preview && (
                  <div className="preview-container">
                    <img src={form.foto_principal_preview} alt="Vista previa" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t('galeria_fotos')}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGaleriaChange}
                />
                <div className="form-help">
                  <i className="fas fa-info-circle"></i> {t('galeria_descripcion')}
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
            </div>
          )}

          {/* Botones de navegación */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-prev" onClick={prevStep}>
                <i className="fas fa-arrow-left"></i> {t('botones.anterior')}
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button type="button" className="btn-next" onClick={nextStep}>
                {t('botones.siguiente')} <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                {loading ? t('botones.registrando') : t('botones.registrar')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaMascota;