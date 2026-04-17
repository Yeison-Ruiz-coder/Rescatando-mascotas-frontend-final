import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Image, FileText, X, Upload, Save } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const AdminEventosEdit = () => {
    const { t } = useTranslation('eventos');
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        Nombre_evento: '',
        Lugar_evento: '',
        Descripcion: '',
        Fecha_evento: '',
        imagen: null
    });

    useEffect(() => {
        loadEvento();
    }, [id]);

    const loadEvento = async () => {
        try {
            const response = await api.get(`/admin/eventos/${id}`);
            const evento = response.data.data || response.data;
            setFormData({
                Nombre_evento: evento.nombre_evento,
                Lugar_evento: evento.lugar_evento,
                Descripcion: evento.descripcion,
                Fecha_evento: evento.fecha_evento?.slice(0, 16),
                imagen: null
            });
            setPreviewImage(evento.imagen_url);
        } catch (error) {
            console.error('Error:', error);
            navigate('/admin/eventos');
        } finally {
            setLoading(false);
        }
    };

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

        setSaving(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Nombre_evento', formData.Nombre_evento);
            formDataToSend.append('Lugar_evento', formData.Lugar_evento);
            formDataToSend.append('Descripcion', formData.Descripcion);
            formDataToSend.append('Fecha_evento', formData.Fecha_evento);
            if (formData.imagen) formDataToSend.append('imagen', formData.imagen);
            formDataToSend.append('_method', 'PUT');

            await api.post(`/admin/eventos/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/admin/eventos');
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(t('mensajes.error_actualizar'));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="eventos-loading">
                <div className="spinner"></div>
                <p>{t('cargando_evento')}</p>
            </div>
        );
    }

    return (
        <div className="eventos-form-container">
            <div className="form-card">
                <div className="form-card-header admin-header">
                    <h2>{t('editar.titulo')}</h2>
                    <p>{t('editar.subtitulo')}</p>
                </div>
                <div className="form-card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label><FileText size={16} /> {t('crear.nombre_evento')} *</label>
                                <input type="text" name="Nombre_evento" className={`form-control ${errors.Nombre_evento ? 'is-invalid' : ''}`} value={formData.Nombre_evento} onChange={handleChange} />
                                {errors.Nombre_evento && <div className="invalid-feedback">{errors.Nombre_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><MapPin size={16} /> {t('crear.lugar_evento')} *</label>
                                <input type="text" name="Lugar_evento" className={`form-control ${errors.Lugar_evento ? 'is-invalid' : ''}`} value={formData.Lugar_evento} onChange={handleChange} />
                                {errors.Lugar_evento && <div className="invalid-feedback">{errors.Lugar_evento}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FileText size={16} /> {t('crear.descripcion')} *</label>
                            <textarea name="Descripcion" rows="5" className={`form-control ${errors.Descripcion ? 'is-invalid' : ''}`} value={formData.Descripcion} onChange={handleChange} />
                            {errors.Descripcion && <div className="invalid-feedback">{errors.Descripcion}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Calendar size={16} /> {t('crear.fecha_evento')} *</label>
                                <input type="datetime-local" name="Fecha_evento" className={`form-control ${errors.Fecha_evento ? 'is-invalid' : ''}`} value={formData.Fecha_evento} onChange={handleChange} />
                                {errors.Fecha_evento && <div className="invalid-feedback">{errors.Fecha_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><Image size={16} /> {t('crear.imagen')}</label>
                                <div className="file-upload">
                                    <input type="file" id="imagen" className="file-input" accept="image/*" onChange={handleFileChange} />
                                    <label htmlFor="imagen" className="file-label"><Upload size={20} /> {t('crear.cambiar_imagen')}</label>
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
                            <button type="button" onClick={() => navigate('/admin/eventos')} className="btn-secondary" disabled={saving}>
                                {t('botones.cancelar')}
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                <Save size={18} /> {saving ? t('botones.guardando') : t('botones.guardar_cambios')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEventosEdit;