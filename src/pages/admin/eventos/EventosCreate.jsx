// src/pages/admin/eventos/EventosCreate.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, Save, Calendar, MapPin, FileText, 
    Image as ImageIcon, X, Loader, Tag, Users, 
    DollarSign, User, Layers 
} from 'lucide-react';
import api from '../../../services/api';
import './EventosForm.css';

const AdminEventosCreate = () => {
    const { t } = useTranslation('eventos');
    const navigate = useNavigate();
    const fechaInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    
    const [formData, setFormData] = useState({
        nombre_evento: '',
        lugar_evento: '',
        descripcion: '',
        fecha_evento: '',
        fecha_fin: '',
        capacidad_maxima: '',
        costo: '',
        organizador: '',
        telefono_contacto: '',
        email_contacto: '',
        categoria: '',
        tags: []
    });
    
    const [tagInput, setTagInput] = useState('');
    const [imagen, setImagen] = useState(null);

    // Función para abrir el calendario nativo
    const openCalendar = () => {
        if (fechaInputRef.current) {
            if (fechaInputRef.current.showPicker) {
                fechaInputRef.current.showPicker();
            } else {
                fechaInputRef.current.focus();
                fechaInputRef.current.click();
            }
        }
    };

    // Validación de solo números para capacidad
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validación de solo números para teléfono
    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^[0-9]{0,15}$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert(t('image_max_size'));
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert(t('image_only'));
                return;
            }
            setImagen(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formDataToSend = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                if (key === 'tags' && formData.tags.length > 0) {
                    formData.tags.forEach(tag => {
                        formDataToSend.append('tags[]', tag);
                    });
                } else if (key === 'tags' && formData.tags.length === 0) {
                    return;
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            }
        });
        
        if (imagen) formDataToSend.append('imagen', imagen);

        try {
            const response = await api.post('/admin/eventos', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const evento = response.data.data || response.data;
            navigate(`/admin/eventos/${evento.id}`);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || t('error_create'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-eventos-form-container">
        {/* Botón volver externo - izquierda, con gradiente */}
        <div className="back-button-wrapper">
            <Link to="/admin/eventos" className="btn-back-gradient">
                <ArrowLeft size={18} />
                {t('back_to_events')}
            </Link>
        </div>

        {/* Card del formulario */}
        <div className="admin-eventos-form-card">
            <div className="form-header">
                <h1>✨ {t('create_event')}</h1>
                <p>{t('create_event_desc')}</p>
            </div>
                <form onSubmit={handleSubmit} className="eventos-form">
                    <div className="form-grid">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="form-column">
                            <div className="form-group required">
                                <label><FileText size={16} /> {t('event_name')}</label>
                                <input
                                    type="text"
                                    name="nombre_evento"
                                    value={formData.nombre_evento}
                                    onChange={handleChange}
                                    className={errors.nombre_evento ? 'error' : ''}
                                    placeholder={t('event_name_placeholder')}
                                    required
                                />
                                {errors.nombre_evento && <span className="error-message">{errors.nombre_evento[0]}</span>}
                            </div>

                            <div className="form-group required">
                                <label><MapPin size={16} /> {t('location')}</label>
                                <input
                                    type="text"
                                    name="lugar_evento"
                                    value={formData.lugar_evento}
                                    onChange={handleChange}
                                    className={errors.lugar_evento ? 'error' : ''}
                                    placeholder={t('location_placeholder')}
                                    required
                                />
                                {errors.lugar_evento && <span className="error-message">{errors.lugar_evento[0]}</span>}
                            </div>

                            <div className="form-group required" style={{ position: 'relative' }}>
                                <label><Calendar size={16} /> {t('start_date')} *</label>
                                <input
                                    ref={fechaInputRef}
                                    type="datetime-local"
                                    name="fecha_evento"
                                    value={formData.fecha_evento}
                                    onChange={handleChange}
                                    className={errors.fecha_evento ? 'error' : ''}
                                    required
                                />
                                <div className="calendar-icon-custom" onClick={openCalendar}>
                                    <Calendar size={16} />
                                </div>
                                {errors.fecha_evento && <span className="error-message">{errors.fecha_evento[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> {t('end_date')}</label>
                                <input
                                    type="datetime-local"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label><Users size={16} /> {t('max_capacity')}</label>
                                <input
                                    type="text"
                                    name="capacidad_maxima"
                                    value={formData.capacidad_maxima}
                                    onChange={handleNumberChange}
                                    placeholder={t('capacity_placeholder')}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>

                        {/* COLUMNA DERECHA */}
                        <div className="form-column">
                            <div className="form-group required">
                                <label><FileText size={16} /> {t('description')}</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="5"
                                    className={errors.descripcion ? 'error' : ''}
                                    placeholder={t('description_placeholder')}
                                    required
                                />
                                {errors.descripcion && <span className="error-message">{errors.descripcion[0]}</span>}
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label><DollarSign size={16} /> {t('cost')}</label>
                                    <input 
                                        type="text" 
                                        name="costo" 
                                        value={formData.costo} 
                                        onChange={handleChange} 
                                        placeholder={t('cost_placeholder')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Layers size={16} /> {t('category')}</label>
                                    <input 
                                        type="text" 
                                        name="categoria" 
                                        value={formData.categoria} 
                                        onChange={handleChange} 
                                        placeholder={t('category_placeholder')}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><User size={16} /> {t('contact')}</label>
                                <div className="form-row-2">
                                    <input 
                                        type="text" 
                                        name="organizador" 
                                        value={formData.organizador} 
                                        onChange={handleChange} 
                                        placeholder={t('organizer_placeholder')}
                                    />
                                    <input 
                                        type="tel" 
                                        name="telefono_contacto" 
                                        value={formData.telefono_contacto} 
                                        onChange={handlePhoneChange} 
                                        placeholder={t('phone_placeholder')}
                                        inputMode="numeric"
                                    />
                                </div>
                                <input 
                                    type="email" 
                                    name="email_contacto" 
                                    value={formData.email_contacto} 
                                    onChange={handleChange} 
                                    placeholder={t('email_placeholder')}
                                />
                            </div>

                            <div className="form-group">
                                <label><Tag size={16} /> {t('tags')}</label>
                                <div className="tags-input-container">
                                    <div className="tags-list">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="tag">
                                                #{tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="tags-input-wrapper">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder={t('tags_placeholder')}
                                        />
                                        <button type="button" onClick={handleAddTag}>+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><ImageIcon size={16} /> {t('event_image')}</label>
                                <div className="image-upload-area">
                                    {previewImage ? (
                                        <div className="image-preview">
                                            <img src={previewImage} alt="Preview" />
                                            <button type="button" onClick={() => { setImagen(null); setPreviewImage(null); }}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="upload-label">
                                            <input type="file" accept="image/*" onChange={handleImageChange} />
                                            <div className="upload-placeholder">
                                                <ImageIcon size={32} />
                                                <span>{t('click_to_upload')}</span>
                                                <small>{t('image_max_size_text')}</small>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/eventos" className="btn-cancel">
                            <X size={16} /> {t('cancel')}
                        </Link>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Loader size={20} className="spinner" /> : <Save size={20} />}
                            {loading ? t('creating') : t('create_event_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEventosCreate;