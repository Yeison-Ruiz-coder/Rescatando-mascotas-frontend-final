import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Image, FileText, X, Upload } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const AdminEventosCreate = () => {
    const { t } = useTranslation('eventos');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        Nombre_evento: '',
        Lugar_evento: '',
        Descripcion: '',
        Fecha_evento: '',
        imagen: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, imagen: t('errores.imagen_grande') }));
                return;
            }
            setFormData(prev => ({ ...prev, imagen: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Nombre_evento.trim()) newErrors.Nombre_evento = t('errores.nombre_requerido');
        if (!formData.Lugar_evento.trim()) newErrors.Lugar_evento = t('errores.lugar_requerido');
        if (!formData.Descripcion.trim()) newErrors.Descripcion = t('errores.descripcion_requerida');
        if (!formData.Fecha_evento) newErrors.Fecha_evento = t('errores.fecha_requerida');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Nombre_evento', formData.Nombre_evento);
            formDataToSend.append('Lugar_evento', formData.Lugar_evento);
            formDataToSend.append('Descripcion', formData.Descripcion);
            formDataToSend.append('Fecha_evento', formData.Fecha_evento);
            if (formData.imagen) formDataToSend.append('imagen', formData.imagen);

            await api.post('/admin/eventos', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/admin/eventos');
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(t('mensajes.error_crear'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eventos-form-container">
            <div className="form-card">
                <div className="form-card-header admin-header">
                    <h2>{t('crear.titulo')}</h2>
                    <p>{t('crear.subtitulo')}</p>
                </div>
                <div className="form-card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label><FileText size={16} /> {t('crear.nombre_evento')} *</label>
                                <input 
                                    type="text" 
                                    name="Nombre_evento" 
                                    className={`form-control ${errors.Nombre_evento ? 'is-invalid' : ''}`} 
                                    value={formData.Nombre_evento} 
                                    onChange={handleChange} 
                                    placeholder={t('crear.nombre_placeholder')} 
                                />
                                {errors.Nombre_evento && <div className="invalid-feedback">{errors.Nombre_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><MapPin size={16} /> {t('crear.lugar_evento')} *</label>
                                <input 
                                    type="text" 
                                    name="Lugar_evento" 
                                    className={`form-control ${errors.Lugar_evento ? 'is-invalid' : ''}`} 
                                    value={formData.Lugar_evento} 
                                    onChange={handleChange} 
                                    placeholder={t('crear.lugar_placeholder')} 
                                />
                                {errors.Lugar_evento && <div className="invalid-feedback">{errors.Lugar_evento}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FileText size={16} /> {t('crear.descripcion')} *</label>
                            <textarea 
                                name="Descripcion" 
                                rows="5" 
                                className={`form-control ${errors.Descripcion ? 'is-invalid' : ''}`} 
                                value={formData.Descripcion} 
                                onChange={handleChange} 
                                placeholder={t('crear.descripcion_placeholder')} 
                            />
                            {errors.Descripcion && <div className="invalid-feedback">{errors.Descripcion}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Calendar size={16} /> {t('crear.fecha_evento')} *</label>
                                <input 
                                    type="datetime-local" 
                                    name="Fecha_evento" 
                                    className={`form-control ${errors.Fecha_evento ? 'is-invalid' : ''}`} 
                                    value={formData.Fecha_evento} 
                                    onChange={handleChange} 
                                />
                                {errors.Fecha_evento && <div className="invalid-feedback">{errors.Fecha_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><Image size={16} /> {t('crear.imagen')}</label>
                                <div className="file-upload">
                                    <input type="file" id="imagen" className="file-input" accept="image/*" onChange={handleFileChange} />
                                    <label htmlFor="imagen" className="file-label"><Upload size={20} /> {t('crear.seleccionar_imagen')}</label>
                                </div>
                                {previewImage && (
                                    <div className="image-preview">
                                        <img src={previewImage} alt={t('crear.vista_previa')} />
                                        <button type="button" onClick={() => { setPreviewImage(null); setFormData(prev => ({ ...prev, imagen: null })); }} className="remove-preview">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <div className="form-text">{t('crear.formatos_imagen')}</div>
                                {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate('/admin/eventos')} className="btn-secondary" disabled={loading}>
                                {t('botones.cancelar')}
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? t('botones.creando') : t('botones.crear_evento_global')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosCreate;