// src/pages/fundacion/adopciones/CrearSeguimiento.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import './CrearSeguimiento.css';

registerLocale('es', es);

const CrearSeguimiento = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { adopcionId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cargandoAdopcion, setCargandoAdopcion] = useState(true);
  const [adopcion, setAdopcion] = useState(null);
  const [fechaSeguimientoDate, setFechaSeguimientoDate] = useState(new Date());
  const [proximoSeguimientoDate, setProximoSeguimientoDate] = useState(null);
  const [form, setForm] = useState({
    tipo_seguimiento: '',
    fecha_seguimiento: new Date().toISOString().split('T')[0],
    observaciones: '',
    estado_mascota: '',
    resultado: '',
    proximo_seguimiento: '',
    recomendaciones: '',
    condiciones_hogar: '',
    observaciones_hogar: '',
    convive_con_otros_animales: false,
    comportamiento_observado: '',
    requiere_nuevo_seguimiento: false,
    firma_adoptante: false,
  });
  const [archivos, setArchivos] = useState({
    foto_url: null,
    fotos_adicionales: [],
    documento_url: null,
  });
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

  const fundacionName = user?.nombre || user?.name || t('fundacion');
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  useEffect(() => {
    if (adopcionId) {
      fetchAdopcion();
    }
  }, [adopcionId]);

  const fetchAdopcion = async () => {
    try {
      setCargandoAdopcion(true);
      const response = await api.get(`/entity/adopciones/${adopcionId}`);
      setAdopcion(response.data.data);
    } catch (err) {
      toast.error(t('error_cargar_adopcion'));
      navigate('/fundacion/adopciones');
    } finally {
      setCargandoAdopcion(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleDateChange = (date, fieldName) => {
    if (fieldName === 'fecha_seguimiento') {
      setFechaSeguimientoDate(date);
      setForm(prev => ({
        ...prev,
        fecha_seguimiento: date ? date.toISOString().split('T')[0] : ''
      }));
    } else if (fieldName === 'proximo_seguimiento') {
      setProximoSeguimientoDate(date);
      setForm(prev => ({
        ...prev,
        proximo_seguimiento: date ? date.toISOString().split('T')[0] : ''
      }));
    }
    if (errores[fieldName]) {
      setErrores(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'fotos_adicionales') {
      setArchivos(prev => ({
        ...prev,
        fotos_adicionales: Array.from(files)
      }));
    } else {
      setArchivos(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.tipo_seguimiento) newErrors.tipo_seguimiento = t('campo_requerido');
    if (!form.fecha_seguimiento) newErrors.fecha_seguimiento = t('campo_requerido');
    if (!form.observaciones || form.observaciones.length < 10) {
      newErrors.observaciones = t('observaciones_minimo');
    }
    if (!form.estado_mascota) newErrors.estado_mascota = t('campo_requerido');
    
    setErrores(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (archivos.foto_url) {
        formData.append('foto_url', archivos.foto_url);
      }
      if (archivos.documento_url) {
        formData.append('documento_url', archivos.documento_url);
      }
      archivos.fotos_adicionales.forEach((foto, index) => {
        formData.append(`fotos_adicionales[${index}]`, foto);
      });

      await api.post(`/entity/adopciones/${adopcionId}/seguimientos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(t('seguimiento_creado'));
      navigate('/fundacion/adopciones/seguimientos');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || t('error_crear_seguimiento'));
    } finally {
      setLoading(false);
    }
  };

  if (cargandoAdopcion) {
    return (
      <div className="cs-container">
        <LoadingSpinner text={t('cargando')} />
      </div>
    );
  }

  return (
    <div className="cs-container">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t('nuevo_seguimiento'),
          solicitudes: 0,
          adopciones: 0,
          eventos: 0,
        }}
      />

      <div className="cs-content">
        <div className="bento-container">
          <div className="cs-header">
            <button 
              className="cs-btn-back" 
              onClick={() => navigate('/fundacion/adopciones/seguimientos')}
            >
              <i className="fas fa-arrow-left"></i> {t('volver')}
            </button>
            <h1>
              <i className="fas fa-plus-circle"></i>
              {t('nuevo_seguimiento')}
            </h1>
            <p className="cs-subtitle">
              {t('para')}: <strong>{adopcion?.mascota?.nombre_mascota || t('no_disponible')}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="cs-form">
            <div className="cs-form-grid">
              <div className="cs-form-group">
                <label>{t('tipo_seguimiento')} <span className="required">*</span></label>
                <select
                  name="tipo_seguimiento"
                  value={form.tipo_seguimiento}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('tipo_seguimiento')}
                  className={errores.tipo_seguimiento ? 'error' : ''}
                >
                  <option value="">{t('selecciona_tipo')}</option>
                  <option value="virtual">{t('tipo_virtual')}</option>
                  <option value="domiciliario">{t('tipo_domiciliario')}</option>
                  <option value="telefonico">{t('tipo_telefonico')}</option>
                </select>
                {errores.tipo_seguimiento && <span className="cs-error-text">{errores.tipo_seguimiento}</span>}
              </div>

              <div className="cs-form-group">
                <label>{t('fecha_seguimiento')} <span className="required">*</span></label>
                <div className="datepicker-wrapper">
                  <DatePicker
                    selected={fechaSeguimientoDate}
                    onChange={(date) => handleDateChange(date, 'fecha_seguimiento')}
                    onBlur={() => handleBlur('fecha_seguimiento')}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className={`datepicker-input ${errores.fecha_seguimiento ? 'error' : ''}`}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    locale="es"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    isClearable
                  />
                </div>
                {errores.fecha_seguimiento && <span className="cs-error-text">{errores.fecha_seguimiento}</span>}
              </div>

              <div className="cs-form-group">
                <label>{t('estado_mascota')} <span className="required">*</span></label>
                <select
                  name="estado_mascota"
                  value={form.estado_mascota}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('estado_mascota')}
                  className={errores.estado_mascota ? 'error' : ''}
                >
                  <option value="">{t('selecciona_estado')}</option>
                  <option value="excelente">{t('estado_excelente')}</option>
                  <option value="bueno">{t('estado_bueno')}</option>
                  <option value="regular">{t('estado_regular')}</option>
                  <option value="preocupante">{t('estado_preocupante')}</option>
                </select>
                {errores.estado_mascota && <span className="cs-error-text">{errores.estado_mascota}</span>}
              </div>

              <div className="cs-form-group">
                <label>{t('resultado')}</label>
                <select
                  name="resultado"
                  value={form.resultado}
                  onChange={handleInputChange}
                >
                  <option value="">{t('selecciona_resultado')}</option>
                  <option value="satisfactorio">{t('resultado_satisfactorio')}</option>
                  <option value="observaciones">{t('resultado_observaciones')}</option>
                  <option value="incumplimiento">{t('resultado_incumplimiento')}</option>
                  <option value="reingreso">{t('resultado_reingreso')}</option>
                </select>
              </div>

              <div className="cs-form-group full">
                <label>{t('observaciones')} <span className="required">*</span></label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('observaciones')}
                  rows="4"
                  placeholder={t('observaciones_placeholder')}
                  className={errores.observaciones ? 'error' : ''}
                />
                {errores.observaciones && <span className="cs-error-text">{errores.observaciones}</span>}
              </div>

              <div className="cs-form-group full">
                <label>{t('recomendaciones')}</label>
                <textarea
                  name="recomendaciones"
                  value={form.recomendaciones}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={t('recomendaciones_placeholder')}
                />
              </div>

              <div className="cs-form-group">
                <label>{t('condiciones_hogar')}</label>
                <select
                  name="condiciones_hogar"
                  value={form.condiciones_hogar}
                  onChange={handleInputChange}
                >
                  <option value="">{t('seleccionar')}</option>
                  <option value="optimas">{t('condicion_optimas')}</option>
                  <option value="aceptables">{t('condicion_aceptables')}</option>
                  <option value="mejorables">{t('condicion_mejorables')}</option>
                  <option value="precarias">{t('condicion_precarias')}</option>
                </select>
              </div>

              <div className="cs-form-group">
                <label>{t('proximo_seguimiento')}</label>
                <div className="datepicker-wrapper">
                  <DatePicker
                    selected={proximoSeguimientoDate}
                    onChange={(date) => handleDateChange(date, 'proximo_seguimiento')}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="datepicker-input"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    locale="es"
                    yearDropdownItemNumber={5}
                    scrollableYearDropdown
                    minDate={new Date()}
                    isClearable
                  />
                </div>
              </div>

              <div className="cs-form-group full">
                <label>{t('comportamiento_observado')}</label>
                <textarea
                  name="comportamiento_observado"
                  value={form.comportamiento_observado}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder={t('comportamiento_placeholder')}
                />
              </div>

              <div className="cs-form-group full">
                <label>{t('observaciones_hogar')}</label>
                <textarea
                  name="observaciones_hogar"
                  value={form.observaciones_hogar}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder={t('observaciones_hogar_placeholder')}
                />
              </div>

              <div className="cs-form-group full">
                <div className="cs-checkboxes">
                  <label className="cs-checkbox">
                    <input
                      type="checkbox"
                      name="convive_con_otros_animales"
                      checked={form.convive_con_otros_animales}
                      onChange={handleInputChange}
                    />
                    <span>{t('convive_con_otros_animales')}</span>
                  </label>
                  <label className="cs-checkbox">
                    <input
                      type="checkbox"
                      name="requiere_nuevo_seguimiento"
                      checked={form.requiere_nuevo_seguimiento}
                      onChange={handleInputChange}
                    />
                    <span>{t('requiere_nuevo_seguimiento')}</span>
                  </label>
                  <label className="cs-checkbox">
                    <input
                      type="checkbox"
                      name="firma_adoptante"
                      checked={form.firma_adoptante}
                      onChange={handleInputChange}
                    />
                    <span>{t('firma_adoptante')}</span>
                  </label>
                </div>
              </div>

              <div className="cs-form-group">
                <label>{t('foto_principal')}</label>
                <input
                  type="file"
                  name="foto_url"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cs-file-input"
                />
              </div>

              <div className="cs-form-group">
                <label>{t('fotos_adicionales')}</label>
                <input
                  type="file"
                  name="fotos_adicionales"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="cs-file-input"
                />
                <small>{t('max_5_fotos')}</small>
              </div>

              <div className="cs-form-group">
                <label>{t('documento')}</label>
                <input
                  type="file"
                  name="documento_url"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cs-file-input"
                />
                <small>{t('documento_formatos')}</small>
              </div>
            </div>

            <div className="cs-form-actions">
              <button
                type="button"
                className="cs-btn-cancelar"
                onClick={() => navigate('/fundacion/adopciones/seguimientos')}
              >
                <i className="fas fa-times"></i> {t('cancelar')}
              </button>
              <button
                type="submit"
                className="cs-btn-guardar"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {t('guardando')}</>
                ) : (
                  <><i className="fas fa-save"></i> {t('guardar')}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearSeguimiento;