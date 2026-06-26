// src/pages/fundacion/adopciones/EditarSeguimiento.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Seguimientos.css';

const EditarSeguimiento = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [seguimiento, setSeguimiento] = useState(null);
  const [form, setForm] = useState({
    tipo_seguimiento: 'virtual',
    fecha_seguimiento: '',
    observaciones: '',
    estado_mascota: 'bueno',
    resultado: 'satisfactorio',
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
  const [fotosExistentes, setFotosExistentes] = useState([]);

  useEffect(() => {
    if (id) {
      fetchSeguimiento();
    }
  }, [id]);

  const fetchSeguimiento = async () => {
    try {
      setCargando(true);
      const response = await api.get(`/entity/adopciones/seguimientos/${id}`);
      const data = response.data.data;
      setSeguimiento(data);
      
      // Cargar datos al formulario
      setForm({
        tipo_seguimiento: data.tipo_seguimiento || 'virtual',
        fecha_seguimiento: data.fecha_seguimiento?.split('T')[0] || '',
        observaciones: data.observaciones || '',
        estado_mascota: data.estado_mascota || 'bueno',
        resultado: data.resultado || 'satisfactorio',
        proximo_seguimiento: data.proximo_seguimiento?.split('T')[0] || '',
        recomendaciones: data.recomendaciones || '',
        condiciones_hogar: data.condiciones_hogar || '',
        observaciones_hogar: data.observaciones_hogar || '',
        convive_con_otros_animales: data.convive_con_otros_animales || false,
        comportamiento_observado: data.comportamiento_observado || '',
        requiere_nuevo_seguimiento: data.requiere_nuevo_seguimiento || false,
        firma_adoptante: data.firma_adoptante || false,
      });

      // Cargar fotos existentes
      if (data.fotos_adicionales) {
        const fotos = typeof data.fotos_adicionales === 'string' 
          ? JSON.parse(data.fotos_adicionales) 
          : data.fotos_adicionales;
        setFotosExistentes(Array.isArray(fotos) ? fotos : []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('error_cargar_seguimiento'));
      navigate('/fundacion/adopciones/seguimientos');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
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

  const handleEliminarFoto = async (fotoUrl) => {
    if (!window.confirm(t('confirmar_eliminar_foto'))) return;
    
    try {
      await api.delete(`/entity/adopciones/seguimientos/${id}/fotos`, {
        data: { foto_url: fotoUrl }
      });
      setFotosExistentes(prev => prev.filter(f => f !== fotoUrl));
      toast.success(t('foto_eliminada'));
    } catch (err) {
      toast.error(t('error_eliminar_foto'));
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

      // Para PUT con FormData necesitamos este header
      formData.append('_method', 'PUT');

      await api.post(`/entity/adopciones/seguimientos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(t('seguimiento_actualizado'));
      navigate('/fundacion/adopciones/seguimientos');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || t('error_actualizar_seguimiento'));
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="seg-container">
        <LoadingSpinner text={t('cargando')} />
      </div>
    );
  }

  return (
    <div className="seg-container">
      <div className="seg-wrapper">
        <div className="seg-header">
          <div className="seg-header-left">
            <h1>
              <i className="fas fa-edit"></i>
              {t('editar_seguimiento')}
            </h1>
            <p>#{id} - {t('editando')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="seg-form">
          <div className="seg-form-grid">
            {/* Tipo de seguimiento */}
            <div className="seg-form-group">
              <label>{t('tipo_seguimiento')} *</label>
              <select
                name="tipo_seguimiento"
                value={form.tipo_seguimiento}
                onChange={handleChange}
                className={errores.tipo_seguimiento ? 'error' : ''}
              >
                <option value="virtual">{t('tipo_virtual')}</option>
                <option value="domiciliario">{t('tipo_domiciliario')}</option>
                <option value="telefonico">{t('tipo_telefonico')}</option>
              </select>
              {errores.tipo_seguimiento && <span className="seg-error-text">{errores.tipo_seguimiento}</span>}
            </div>

            {/* Fecha seguimiento */}
            <div className="seg-form-group">
              <label>{t('fecha_seguimiento')} *</label>
              <input
                type="date"
                name="fecha_seguimiento"
                value={form.fecha_seguimiento}
                onChange={handleChange}
                className={errores.fecha_seguimiento ? 'error' : ''}
              />
              {errores.fecha_seguimiento && <span className="seg-error-text">{errores.fecha_seguimiento}</span>}
            </div>

            {/* Estado mascota */}
            <div className="seg-form-group">
              <label>{t('estado_mascota')} *</label>
              <select
                name="estado_mascota"
                value={form.estado_mascota}
                onChange={handleChange}
                className={errores.estado_mascota ? 'error' : ''}
              >
                <option value="excelente">{t('estado_excelente')}</option>
                <option value="bueno">{t('estado_bueno')}</option>
                <option value="regular">{t('estado_regular')}</option>
                <option value="preocupante">{t('estado_preocupante')}</option>
              </select>
              {errores.estado_mascota && <span className="seg-error-text">{errores.estado_mascota}</span>}
            </div>

            {/* Resultado */}
            <div className="seg-form-group">
              <label>{t('resultado')}</label>
              <select
                name="resultado"
                value={form.resultado}
                onChange={handleChange}
              >
                <option value="satisfactorio">{t('resultado_satisfactorio')}</option>
                <option value="observaciones">{t('resultado_observaciones')}</option>
                <option value="incumplimiento">{t('resultado_incumplimiento')}</option>
                <option value="reingreso">{t('resultado_reingreso')}</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="seg-form-group full">
              <label>{t('observaciones')} *</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows="4"
                className={errores.observaciones ? 'error' : ''}
              />
              {errores.observaciones && <span className="seg-error-text">{errores.observaciones}</span>}
            </div>

            {/* Recomendaciones */}
            <div className="seg-form-group full">
              <label>{t('recomendaciones')}</label>
              <textarea
                name="recomendaciones"
                value={form.recomendaciones}
                onChange={handleChange}
                rows="3"
              />
            </div>

            {/* Condiciones hogar */}
            <div className="seg-form-group">
              <label>{t('condiciones_hogar')}</label>
              <select
                name="condiciones_hogar"
                value={form.condiciones_hogar}
                onChange={handleChange}
              >
                <option value="">{t('seleccionar')}</option>
                <option value="optimas">{t('condicion_optimas')}</option>
                <option value="aceptables">{t('condicion_aceptables')}</option>
                <option value="mejorables">{t('condicion_mejorables')}</option>
                <option value="precarias">{t('condicion_precarias')}</option>
              </select>
            </div>

            {/* Próximo seguimiento */}
            <div className="seg-form-group">
              <label>{t('proximo_seguimiento')}</label>
              <input
                type="date"
                name="proximo_seguimiento"
                value={form.proximo_seguimiento}
                onChange={handleChange}
              />
            </div>

            {/* Comportamiento observado */}
            <div className="seg-form-group full">
              <label>{t('comportamiento_observado')}</label>
              <textarea
                name="comportamiento_observado"
                value={form.comportamiento_observado}
                onChange={handleChange}
                rows="2"
              />
            </div>

            {/* Fotos existentes */}
            {fotosExistentes.length > 0 && (
              <div className="seg-form-group full">
                <label>{t('fotos_existentes')}</label>
                <div className="seg-fotos-grid">
                  {fotosExistentes.map((foto, index) => (
                    <div key={index} className="seg-foto-item">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                      <button
                        type="button"
                        className="seg-foto-eliminar"
                        onClick={() => handleEliminarFoto(foto)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="seg-form-group full">
              <div className="seg-checkboxes">
                <label className="seg-checkbox">
                  <input
                    type="checkbox"
                    name="convive_con_otros_animales"
                    checked={form.convive_con_otros_animales}
                    onChange={handleChange}
                  />
                  <span>{t('convive_con_otros_animales')}</span>
                </label>
                <label className="seg-checkbox">
                  <input
                    type="checkbox"
                    name="requiere_nuevo_seguimiento"
                    checked={form.requiere_nuevo_seguimiento}
                    onChange={handleChange}
                  />
                  <span>{t('requiere_nuevo_seguimiento')}</span>
                </label>
                <label className="seg-checkbox">
                  <input
                    type="checkbox"
                    name="firma_adoptante"
                    checked={form.firma_adoptante}
                    onChange={handleChange}
                  />
                  <span>{t('firma_adoptante')}</span>
                </label>
              </div>
            </div>

            {/* Archivos */}
            <div className="seg-form-group">
              <label>{t('foto_principal')}</label>
              <input
                type="file"
                name="foto_url"
                accept="image/*"
                onChange={handleFileChange}
                className="seg-file-input"
              />
              {seguimiento?.foto_url && (
                <div className="seg-foto-actual">
                  <span>{t('foto_actual')}:</span>
                  <a href={seguimiento.foto_url} target="_blank" rel="noopener noreferrer">
                    {t('ver_foto')}
                  </a>
                </div>
              )}
            </div>

            <div className="seg-form-group">
              <label>{t('fotos_adicionales')}</label>
              <input
                type="file"
                name="fotos_adicionales"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="seg-file-input"
              />
              <small>{t('max_5_fotos')}</small>
            </div>

            <div className="seg-form-group">
              <label>{t('documento')}</label>
              <input
                type="file"
                name="documento_url"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="seg-file-input"
              />
              <small>{t('documento_formatos')}</small>
              {seguimiento?.documento_url && (
                <div className="seg-foto-actual">
                  <span>{t('documento_actual')}:</span>
                  <a href={seguimiento.documento_url} target="_blank" rel="noopener noreferrer">
                    {t('ver_documento')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="seg-form-actions">
            <button
              type="button"
              className="seg-btn-cancelar"
              onClick={() => navigate('/fundacion/adopciones/seguimientos')}
            >
              {t('cancelar')}
            </button>
            <button
              type="submit"
              className="seg-btn-guardar"
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> {t('guardando')}</>
              ) : (
                <><i className="fas fa-save"></i> {t('actualizar')}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarSeguimiento;